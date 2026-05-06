"use client";

import { useCreateCaseMutation } from "@/services/api/patient/create-case";
import { useSendChatMessageMutation } from "@/services/api/patient/send-chat-message";
import { useCaseDetailQuery } from "@/services/api/patient/get-case-detail";
import {
	useUploadCaseFileMutation,
	useAttachExistingFileMutation,
} from "@/services/api/patient/attach-case-file";
import { CASES_URL } from "@/config/client-constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ChatMessage {
	id: string;
	role: "assistant" | "user";
	content: string;
	file_id?: string | null;
	isLoading?: boolean;
}

interface CurrentQuestion {
	id: string;
	question_text: string;
	response_type: "text" | "file";
}

export const useConsultationChatScreen = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryCaseId = searchParams.get("caseId");

	const [caseId, setCaseId] = useState<string | null>(queryCaseId);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [inputText, setInputText] = useState("");
	const [currentQuestion, setCurrentQuestion] =
		useState<CurrentQuestion | null>(null);
	const [canSkipCurrentQuestion, setCanSkipCurrentQuestion] = useState(false);
	const [caseStatus, setCaseStatus] = useState<
		"in_progress" | "completed" | "cancelled"
	>("in_progress");
	const [isRecording, setIsRecording] = useState(false);
	const [showFilePicker, setShowFilePicker] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const recognitionRef = useRef<any>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const hasInitializedRef = useRef(false);
	const messageIdCounter = useRef(0);

	const nextMsgId = () => {
		messageIdCounter.current += 1;
		return `local-${messageIdCounter.current}`;
	};

	const createCaseMutation = useCreateCaseMutation();
	const sendMessageMutation = useSendChatMessageMutation();
	const uploadFileMutation = useUploadCaseFileMutation();
	const attachFileMutation = useAttachExistingFileMutation();

	const caseDetailQuery = useCaseDetailQuery({
		caseId,
		enabled: Boolean(caseId),
	});

	useEffect(() => {
		if (!queryCaseId) return;
		if (caseId === queryCaseId) return;
		setCaseId(queryCaseId);
	}, [queryCaseId, caseId]);

	useEffect(() => {
		if (caseId || queryCaseId || hasInitializedRef.current) return;
		hasInitializedRef.current = true;

		createCaseMutation.mutate(undefined, {
			onSuccess: (data) => {
				setCaseId(data.case.id);
				window.history.replaceState(
					null,
					"",
					`/consultation/chat?caseId=${data.case.id}`,
				);
			},
			onError: () => {
				toast.error("Failed to start consultation.");
				router.push(CASES_URL);
			},
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [caseId, queryCaseId]);

	useEffect(() => {
		if (!caseDetailQuery.data || messages.length > 0) return;

		const caseData = caseDetailQuery.data;
		const initialQuestion = caseData.info_state?.question;
		if (initialQuestion) {
			setCurrentQuestion({
				id: initialQuestion.id,
				question_text: initialQuestion.question_text,
				response_type: initialQuestion.response_type,
			});
		}
		const meta = caseData.info_state?.collected_fields?.__question_meta as
			| Record<string, unknown>
			| undefined;
		const currentKey = `question_${caseData.info_state?.current_question_index ?? 0}`;
		const questionMeta = meta?.[currentKey] as { retry_count?: number } | undefined;
		setCanSkipCurrentQuestion(
			(initialQuestion?.response_type === "file") ||
				Number(questionMeta?.retry_count ?? 0) >= 5,
		);

		if (caseData.chat_messages && caseData.chat_messages.length > 0) {
			setMessages(
				caseData.chat_messages.map(
					(m: { id: string; role: "assistant" | "user"; content: string; file_id?: string | null }) => ({
						id: m.id,
						role: m.role,
						content: m.content,
						file_id: m.file_id,
					}),
				),
			);
			setCaseStatus(caseData.conversation_status);
			return;
		}

		const firstQuestionMsg =
			"Welcome! I'm your AI medical assistant. I'll be asking you a few questions to understand your condition better. Let's begin.\n\nPlease note: This is AI-generated content. Always verify with your healthcare provider.";

		setMessages([
			{ id: nextMsgId(), role: "assistant", content: firstQuestionMsg },
		]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [caseDetailQuery.data]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSendMessage = useCallback(async () => {
		if (!caseId || !inputText.trim() || sendMessageMutation.isPending) return;
		if (caseStatus !== "in_progress") return;
		if (currentQuestion?.response_type === "file") {
			toast.info("Please attach or select a file to continue.");
			return;
		}

		const userMsg: ChatMessage = {
			id: nextMsgId(),
			role: "user",
			content: inputText.trim(),
		};

		const loadingMsg: ChatMessage = {
			id: nextMsgId(),
			role: "assistant",
			content: "",
			isLoading: true,
		};

		setMessages((prev) => [...prev, userMsg, loadingMsg]);
		const messageText = inputText.trim();
		setInputText("");

		sendMessageMutation.mutate(
			{ caseId, message: messageText },
			{
				onSuccess: (data) => {
					setMessages((prev) => {
						const filtered = prev.filter((m) => !m.isLoading);
						return [
							...filtered,
							{
								id: nextMsgId(),
								role: "assistant" as const,
								content: data.assistant_message,
							},
						];
					});

					if (data.next_question) {
						setCurrentQuestion(data.next_question);
					} else {
						setCurrentQuestion(null);
					}
					setCanSkipCurrentQuestion(Boolean(data.can_skip));

					if (
						data.case_status === "completed" ||
						data.case_status === "cancelled"
					) {
						setCaseStatus(data.case_status);
					}
				},
				onError: (error) => {
					setMessages((prev) => prev.filter((m) => !m.isLoading));
					toast.error(error.message || "Failed to send message.");
				},
			},
		);
	}, [caseId, inputText, sendMessageMutation, caseStatus, currentQuestion]);

	const handleSkipQuestion = useCallback(() => {
		if (!caseId || sendMessageMutation.isPending || caseStatus !== "in_progress") {
			return;
		}

		const userMsg: ChatMessage = {
			id: nextMsgId(),
			role: "user",
			content: "Skipped this question.",
		};
		const loadingMsg: ChatMessage = {
			id: nextMsgId(),
			role: "assistant",
			content: "",
			isLoading: true,
		};

		setMessages((prev) => [...prev, userMsg, loadingMsg]);

		sendMessageMutation.mutate(
			{ caseId, skip: true },
			{
				onSuccess: (data) => {
					setMessages((prev) => {
						const filtered = prev.filter((m) => !m.isLoading);
						return [
							...filtered,
							{
								id: nextMsgId(),
								role: "assistant" as const,
								content: data.assistant_message,
							},
						];
					});

					setInputText("");
					setCurrentQuestion(data.next_question ?? null);
					setCanSkipCurrentQuestion(Boolean(data.can_skip));
					if (data.case_status === "completed" || data.case_status === "cancelled") {
						setCaseStatus(data.case_status);
					}
				},
				onError: (error) => {
					setMessages((prev) => prev.filter((m) => !m.isLoading));
					toast.error(error.message || "Failed to skip question.");
				},
			},
		);
	}, [caseId, sendMessageMutation, caseStatus]);

	const handleAttachFile = useCallback(
		async (file: File) => {
			if (!caseId) return;

			const toastId = toast.loading("Uploading file...");

			uploadFileMutation.mutate(
				{ caseId, file },
				{
					onSuccess: (data) => {
						toast.success("File uploaded!", { id: toastId });
						const fileId = data?.file?.id;

						if (fileId) {
							sendMessageMutation.mutate(
								{
									caseId,
									file_id: fileId,
									message: `Attached file: ${file.name}`,
								},
								{
									onSuccess: (chatData) => {
										setMessages((prev) => [
											...prev,
											{
												id: nextMsgId(),
												role: "user" as const,
												content: `📎 ${file.name}`,
												file_id: fileId,
											},
											{
												id: nextMsgId(),
												role: "assistant" as const,
												content: chatData.assistant_message,
											},
										]);

										if (chatData.next_question) {
											setCurrentQuestion(chatData.next_question);
										}
										setCanSkipCurrentQuestion(Boolean(chatData.can_skip));

										if (
											chatData.case_status === "completed" ||
											chatData.case_status === "cancelled"
										) {
											setCaseStatus(chatData.case_status);
										}
									},
								},
							);
						}

						setShowFilePicker(false);
					},
					onError: (error) => {
						toast.error(error.message || "Upload failed.", { id: toastId });
					},
				},
			);
		},
		[caseId, uploadFileMutation, sendMessageMutation],
	);

	const handleSelectExistingFile = useCallback(
		async (fileId: string, filename: string) => {
			if (!caseId) return;

			attachFileMutation.mutate(
				{ caseId, file_id: fileId },
				{
					onSuccess: () => {
						sendMessageMutation.mutate(
							{
								caseId,
								file_id: fileId,
								message: `Selected existing file: ${filename}`,
							},
							{
								onSuccess: (chatData) => {
									setMessages((prev) => [
										...prev,
										{
											id: nextMsgId(),
											role: "user" as const,
											content: `📎 ${filename}`,
											file_id: fileId,
										},
										{
											id: nextMsgId(),
											role: "assistant" as const,
											content: chatData.assistant_message,
										},
									]);

									if (chatData.next_question) {
										setCurrentQuestion(chatData.next_question);
									}
									setCanSkipCurrentQuestion(Boolean(chatData.can_skip));

									if (
										chatData.case_status === "completed" ||
										chatData.case_status === "cancelled"
									) {
										setCaseStatus(chatData.case_status);
									}
								},
							},
						);

						setShowFilePicker(false);
					},
					onError: (error) => {
						toast.error(error.message || "Failed to attach file.");
					},
				},
			);
		},
		[caseId, attachFileMutation, sendMessageMutation],
	);

	const handleToggleRecording = useCallback(() => {
		if (isRecording) {
			recognitionRef.current?.stop();
			setIsRecording(false);
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const win = window as any;
		const SpeechRecognitionConstructor =
			win.SpeechRecognition ?? win.webkitSpeechRecognition;

		if (!SpeechRecognitionConstructor) {
			toast.error("Voice input is not supported in this browser.");
			return;
		}

		const recognition = new SpeechRecognitionConstructor();
		recognition.continuous = true;
		recognition.interimResults = true;
		recognition.lang = "en-US";

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		recognition.onresult = (event: any) => {
			let transcript = "";
			for (let i = 0; i < event.results.length; i++) {
				transcript += event.results[i]?.[0]?.transcript ?? "";
			}
			setInputText(transcript);
		};

		recognition.onerror = () => {
			setIsRecording(false);
			toast.error("Voice recognition error. Please try again.");
		};

		recognition.onend = () => {
			setIsRecording(false);
		};

		recognitionRef.current = recognition;
		recognition.start();
		setIsRecording(true);
	}, [isRecording]);

	const handleBack = useCallback(() => {
		router.push(CASES_URL);
	}, [router]);

	const isChatDisabled = caseStatus !== "in_progress";
	const isSending =
		sendMessageMutation.isPending ||
		uploadFileMutation.isPending ||
		attachFileMutation.isPending;
	const isInitializing =
		createCaseMutation.isPending || (!caseId && !createCaseMutation.isError);

	return {
		messages,
		inputText,
		setInputText,
		currentQuestion,
		canSkipCurrentQuestion: canSkipCurrentQuestion || currentQuestion?.response_type === "file",
		caseStatus,
		caseId,
		isRecording,
		showFilePicker,
		setShowFilePicker,
		isChatDisabled,
		isSending,
		isInitializing,
		messagesEndRef,
		handleSendMessage,
		handleSkipQuestion,
		handleAttachFile,
		handleSelectExistingFile,
		handleToggleRecording,
		handleBack,
	};
};
