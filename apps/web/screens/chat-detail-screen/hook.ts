"use client";

import { useCaseDetailQuery } from "@/services/api/patient/get-case-detail";
import { useCaseMessagesQuery } from "@/services/api/patient/get-case-messages";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export const useChatDetailScreen = () => {
	const router = useRouter();
	const params = useParams();
	const caseId = params.caseId as string;
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const caseDetailQuery = useCaseDetailQuery({ caseId, enabled: Boolean(caseId) });
	const messagesQuery = useCaseMessagesQuery({ caseId, enabled: Boolean(caseId) });

	const caseData = caseDetailQuery.data;
	const messages = messagesQuery.data?.messages ?? [];

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	const conversationStatus = caseData?.conversation_status ?? "in_progress";
	const isReadOnly = conversationStatus === "completed" || conversationStatus === "cancelled";

	const handleContinueChat = () => {
		router.push(`/consultation/chat?caseId=${caseId}`);
	};

	const handleGoBack = () => {
		router.back();
	};

	return {
		caseId,
		messages,
		conversationStatus,
		isReadOnly,
		isLoading: caseDetailQuery.isLoading || messagesQuery.isLoading,
		messagesEndRef,
		handleContinueChat,
		handleGoBack,
	};
};
