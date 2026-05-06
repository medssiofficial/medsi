import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { sendJsonApiResponse } from "@repo/utils/server";
import { resolvePatientUserIdByClerkId } from "@repo/database/actions/patient";
import {
	getMedicalCaseDetail,
	appendChatMessage,
	advanceCaseQuestion,
	incrementOffTopicStreak,
	cancelCaseChat,
	completeCaseChat,
	getCaseMessages,
} from "@repo/database/actions/medical-case";
import { listIntakeQuestions } from "@repo/database/actions/intake-question";
import { caseFinalAnalysisTask } from "@/trigger/tasks/case-final-analysis";

const GEMINI_CHAT_MODEL = "gemini-3-flash-preview";

interface GeminiChatResponse {
	assistant_message: string;
	is_on_topic: boolean;
	collected_value: string | null;
	detected_language: string | null;
}

const callGeminiForChat = async (args: {
	apiKey: string;
	systemPrompt: string;
	userMessage: string;
}): Promise<GeminiChatResponse> => {
	const url = new URL(
		`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CHAT_MODEL}:generateContent`,
	);
	url.searchParams.set("key", args.apiKey);

	const body = {
		contents: [
			{
				role: "user",
				parts: [
					{
						text: `${args.systemPrompt}\n\nUser's message: "${args.userMessage}"\n\nRespond with JSON only.`,
					},
				],
			},
		],
		generationConfig: {
			temperature: 0.3,
			maxOutputTokens: 2048,
			responseMimeType: "application/json",
		},
	};

	const response = await fetch(url.toString(), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	const rawText = await response.text();
	if (!response.ok) {
		throw new Error(`Gemini API error (${response.status}): ${rawText.slice(0, 500)}`);
	}

	const parsed = JSON.parse(rawText) as {
		candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
	};
	const text =
		parsed.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

	try {
		return JSON.parse(text.trim()) as GeminiChatResponse;
	} catch {
		return {
			assistant_message: text.trim() || "I'm sorry, could you please try again?",
			is_on_topic: true,
			collected_value: null,
			detected_language: null,
		};
	}
};

export const POST = async (req: NextRequest, context: { params: Promise<{ caseId: string }> }) => {
	try {
		const { userId: clerkId, isAuthenticated } = await auth();
		if (!isAuthenticated || !clerkId) {
			return sendJsonApiResponse({ success: false, error: "Unauthorized", code: 401 });
		}

		const userId = await resolvePatientUserIdByClerkId(clerkId);
		if (!userId) {
			return sendJsonApiResponse({ success: false, error: "Patient not found.", code: 404 });
		}

		const { caseId } = await context.params;
		const caseDetail = await getMedicalCaseDetail({ case_id: caseId, user_id: userId });
		if (!caseDetail) {
			return sendJsonApiResponse({ success: false, error: "Case not found.", code: 404 });
		}

		if (
			caseDetail.conversation_status !== "in_progress" ||
			caseDetail.case_stage !== "chatting"
		) {
			return sendJsonApiResponse({
				success: false,
				error: "This case is no longer accepting messages.",
				code: 400,
			});
		}

		const body = (await req.json()) as { message?: string; file_id?: string; skip?: boolean };
		const userMessage = body.message?.trim();
		const fileId = body.file_id?.trim();
		const skip = body.skip === true;

		if (!skip && !userMessage && !fileId) {
			return sendJsonApiResponse({
				success: false,
				error: "Message or file required.",
				code: 400,
			});
		}

		const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
		if (!apiKey) {
			return sendJsonApiResponse({
				success: false,
				error: "AI service not configured.",
				code: 500,
			});
		}

		const allQuestions = await listIntakeQuestions({ active_only: true });
		const infoState = caseDetail.info_state as Record<string, unknown> | null;
		const currentQuestionIndex =
			(infoState?.current_question_index as number | undefined) ?? 0;
		const currentQuestion = allQuestions[currentQuestionIndex] ?? null;
		if (!currentQuestion) {
			return sendJsonApiResponse({
				success: false,
				error: "No active question found.",
				code: 400,
			});
		}

		const completeCaseAfterQuestions = async (collectedFields: Record<string, unknown>) => {
			await completeCaseChat({
				case_id: caseId,
				collected_data: collectedFields,
			});
			try {
				await caseFinalAnalysisTask.trigger({ caseId });
			} catch {
				/* non-fatal */
			}
			const completionMessage =
				"Thank you! All questions have been answered. Your case is now being processed.";
			await appendChatMessage({
				case_id: caseId,
				role: "assistant",
				content: completionMessage,
			});
			return sendJsonApiResponse({
				success: true,
				code: 200,
				data: {
					assistant_message: completionMessage,
					case_status: "completed",
					next_question: null,
				},
			});
		};

		if (skip) {
			await appendChatMessage({
				case_id: caseId,
				role: "user",
				content: "[Skipped question]",
				question_id: currentQuestion.id,
				metadata: { skipped: true },
			});

			const advanceResult = await advanceCaseQuestion({
				case_id: caseId,
				collected_field_key: `question_${currentQuestionIndex}`,
				collected_field_value: {
					skipped: true,
					question_id: currentQuestion.id,
					question_text: currentQuestion.question_text,
				},
			});

			if (!advanceResult.has_more_questions) {
				return await completeCaseAfterQuestions(
					advanceResult.collected_fields as Record<string, unknown>,
				);
			}

			const nextQ = advanceResult.next_question;
			const assistantMessage = nextQ
				? `No problem, I have skipped that one. Next: ${nextQ.question_text}`
				: "No problem, I have skipped that one.";
			await appendChatMessage({
				case_id: caseId,
				role: "assistant",
				content: assistantMessage,
				question_id: nextQ?.id,
			});

			return sendJsonApiResponse({
				success: true,
				code: 200,
				data: {
					assistant_message: assistantMessage,
					case_status: "in_progress",
					next_question: nextQ
						? {
								id: nextQ.id,
								question_text: nextQ.question_text,
								response_type: nextQ.response_type,
							}
						: null,
				},
			});
		}

		const messageContent = fileId
			? `[File attached: ${fileId}]${userMessage ? ` ${userMessage}` : ""}`
			: (userMessage ?? "");

		await appendChatMessage({
			case_id: caseId,
			role: "user",
			content: messageContent,
			file_id: fileId || undefined,
			question_id: currentQuestion?.id,
		});

		// File responses for file-type questions skip AI evaluation
		if (fileId && currentQuestion?.response_type === "file") {
			const fieldKey = `question_${currentQuestionIndex}`;
			const advanceResult = await advanceCaseQuestion({
				case_id: caseId,
				collected_field_key: fieldKey,
				collected_field_value: { file_id: fileId, text: userMessage || "" },
			});

			if (!advanceResult.has_more_questions) {
				return await completeCaseAfterQuestions(
					advanceResult.collected_fields as Record<string, unknown>,
				);
			}

			const nextQ = advanceResult.next_question;
			const nextMessage = nextQ
				? `Got it, thank you. Next: ${nextQ.question_text}`
				: "Thank you for your response.";

			await appendChatMessage({
				case_id: caseId,
				role: "assistant",
				content: nextMessage,
				question_id: nextQ?.id,
			});

			return sendJsonApiResponse({
				success: true,
				code: 200,
				data: {
					assistant_message: nextMessage,
					case_status: "in_progress",
					next_question: nextQ
						? {
								id: nextQ.id,
								question_text: nextQ.question_text,
								response_type: nextQ.response_type,
							}
						: null,
				},
			});
		}

		// Text responses — use AI to evaluate and respond
		const previousMessages = await getCaseMessages({ case_id: caseId }) ?? [];
		const conversationHistory = previousMessages
			.slice(-10)
			.map((m: { role: string; content: string }) => `[${m.role.toUpperCase()}]: ${m.content}`)
			.join("\n");

		const systemPrompt = `You are a medical intake assistant conducting a structured patient interview.
You MUST ask the following question and evaluate the patient's response.

Current question: "${currentQuestion?.question_text ?? "General follow-up"}"
Expected response type: ${currentQuestion?.response_type ?? "text"}
Patient's preferred language: ${caseDetail.language}
Off-topic warnings so far: ${caseDetail.off_topic_count}/3

Previous conversation:
${conversationHistory}

RULES:
1. Evaluate if the user's response is relevant to the current question.
2. If relevant, extract the key information as collected_value.
3. If not relevant, set is_on_topic to false and gently redirect.
4. You may adapt your language to match the patient's language.
5. Keep responses concise and professional.
6. If detected_language differs from current, include it.

Respond in this exact JSON format:
{
  "assistant_message": "Your response to the patient",
  "is_on_topic": true/false,
  "collected_value": "extracted value or null",
  "detected_language": "detected language or null"
}`;

		const aiResponse = await callGeminiForChat({
			apiKey,
			systemPrompt,
			userMessage: userMessage ?? "",
		});

		if (!aiResponse.is_on_topic) {
			const streakResult = await incrementOffTopicStreak({ case_id: caseId });

			if (streakResult.off_topic_streak >= 3) {
				await cancelCaseChat({
					case_id: caseId,
					reason: "Too many off-topic responses",
				});

				const cancelMessage =
					"This conversation has been closed due to repeated off-topic responses. Please start a new consultation.";
				await appendChatMessage({
					case_id: caseId,
					role: "assistant",
					content: cancelMessage,
				});

				return sendJsonApiResponse({
					success: true,
					code: 200,
					data: {
						assistant_message: cancelMessage,
						case_status: "cancelled",
						off_topic_warnings: streakResult.off_topic_streak,
						next_question: null,
					},
				});
			}

			const warningMessage = `${aiResponse.assistant_message}\n\n⚠️ Please stay on topic. Warning ${streakResult.off_topic_streak}/3.`;
			await appendChatMessage({
				case_id: caseId,
				role: "assistant",
				content: warningMessage,
				question_id: currentQuestion?.id,
			});

			return sendJsonApiResponse({
				success: true,
				code: 200,
				data: {
					assistant_message: warningMessage,
					case_status: "in_progress",
					off_topic_warnings: streakResult.off_topic_streak,
					next_question: currentQuestion
						? {
								id: currentQuestion.id,
								question_text: currentQuestion.question_text,
								response_type: currentQuestion.response_type,
							}
						: null,
				},
			});
		}

		// On-topic: advance to next question
		const fieldKey = `question_${currentQuestionIndex}`;
		const advanceResult = await advanceCaseQuestion({
			case_id: caseId,
			collected_field_key: fieldKey,
			collected_field_value: aiResponse.collected_value ?? userMessage,
		});

		if (!advanceResult.has_more_questions) {
			await completeCaseChat({
				case_id: caseId,
				collected_data: advanceResult.collected_fields as Record<string, unknown>,
			});

			try { await caseFinalAnalysisTask.trigger({ caseId }); } catch { /* non-fatal */ }

			const completionMessage =
				"Thank you! All questions have been answered. Your case is now being processed. You'll be notified when the analysis is complete.";
			await appendChatMessage({
				case_id: caseId,
				role: "assistant",
				content: completionMessage,
			});

			return sendJsonApiResponse({
				success: true,
				code: 200,
				data: {
					assistant_message: completionMessage,
					case_status: "completed",
					next_question: null,
				},
			});
		}

		const nextQ = advanceResult.next_question;
		const assistantMsg = nextQ
			? `${aiResponse.assistant_message}\n\n${nextQ.question_text}`
			: aiResponse.assistant_message;

		await appendChatMessage({
			case_id: caseId,
			role: "assistant",
			content: assistantMsg,
			question_id: nextQ?.id,
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				assistant_message: assistantMsg,
				case_status: "in_progress",
				next_question: nextQ
					? {
							id: nextQ.id,
							question_text: nextQ.question_text,
							response_type: nextQ.response_type,
						}
					: null,
			},
		});
	} catch (error) {
		return sendJsonApiResponse({
			success: false,
			error: error instanceof Error ? error.message : "Chat failed.",
			code: 500,
		});
	}
};
