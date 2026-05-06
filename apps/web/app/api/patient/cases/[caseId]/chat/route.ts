import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { sendJsonApiResponse } from "@repo/utils/server";
import { resolvePatientUserIdByClerkId } from "@repo/database/actions/patient";
import {
	getMedicalCaseDetail,
	appendChatMessage,
	advanceCaseQuestion,
	incrementOffTopicStreak,
	incrementCaseQuestionRetry,
	cancelCaseChat,
	completeCaseChat,
	getCaseMessages,
} from "@repo/database/actions/medical-case";
import { listIntakeQuestions } from "@repo/database/actions/intake-question";
import { caseFinalAnalysisTask } from "@/trigger/tasks/case-final-analysis";

const GEMINI_CHAT_MODEL = "gemini-3-flash-preview";
const MAX_QUESTION_RETRIES = 5;

interface GeminiChatResponse {
	assistant_message: string;
	is_on_topic: boolean;
	collected_value: string | null;
	answer_clarity: "clear" | "partial" | "unclear";
	follow_up_question: string | null;
	likely_problem_type: string | null;
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
			answer_clarity: "partial",
			follow_up_question: null,
			likely_problem_type: null,
			detected_language: null,
		};
	}
};

const getWarningMessage = (warningCount: number, questionText: string) => {
	if (warningCount <= 1) {
		return `I want to help you as accurately as possible. Could we please focus on this question: "${questionText}"`;
	}
	if (warningCount === 2) {
		return `Thank you for your patience. To continue safely, please answer only this question now: "${questionText}"`;
	}
	return `I’m unable to continue if we stay off-topic. Please provide a direct answer to: "${questionText}"`;
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
		const infoState = caseDetail.info_state;
		const currentQuestionIndex =
			infoState?.current_question_index ?? 0;
		const currentQuestion = allQuestions[currentQuestionIndex] ?? null;
		if (!currentQuestion) {
			return sendJsonApiResponse({
				success: false,
				error: "No active question found.",
				code: 400,
			});
		}

		const fieldKey = `question_${currentQuestionIndex}`;
		const collectedFields = (infoState?.collected_fields ??
			{}) as Record<string, unknown>;
		const rawQuestionMeta = collectedFields.__question_meta;
		const questionMeta =
			typeof rawQuestionMeta === "object" && rawQuestionMeta !== null
				? (rawQuestionMeta as Record<string, unknown>)
				: {};
		const currentQuestionMeta = questionMeta[fieldKey];
		const currentQuestionMetaRecord =
			typeof currentQuestionMeta === "object" && currentQuestionMeta !== null
				? (currentQuestionMeta as Record<string, unknown>)
				: {};
		const currentRetryCount =
			typeof currentQuestionMetaRecord.retry_count === "number"
				? currentQuestionMetaRecord.retry_count
				: 0;
		const canSkipTextQuestion = currentRetryCount >= MAX_QUESTION_RETRIES;

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
					retry_count: 0,
					retry_limit: MAX_QUESTION_RETRIES,
					can_skip: false,
				},
			});
		};

		if (skip) {
			if (currentQuestion.response_type === "text" && !canSkipTextQuestion) {
				return sendJsonApiResponse({
					success: false,
					error: `You can skip this question after ${MAX_QUESTION_RETRIES} follow-up attempts.`,
					code: 400,
				});
			}

			await appendChatMessage({
				case_id: caseId,
				role: "user",
				content: "[Skipped question]",
				question_id: currentQuestion.id,
				metadata: { skipped: true },
			});

			const advanceResult = await advanceCaseQuestion({
				case_id: caseId,
				collected_field_key: fieldKey,
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
					retry_count: 0,
					retry_limit: MAX_QUESTION_RETRIES,
					can_skip: nextQ?.response_type === "file",
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
					retry_count: 0,
					retry_limit: MAX_QUESTION_RETRIES,
					can_skip: nextQ?.response_type === "file",
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
Current follow-up attempts for this question: ${currentRetryCount}/${MAX_QUESTION_RETRIES}

Previous conversation:
${conversationHistory}

RULES:
1. Evaluate if the user's response is relevant to the current question.
2. If relevant, classify answer_clarity as clear, partial, or unclear.
3. If answer is partial/unclear, ask exactly ONE targeted follow-up question for THIS SAME question.
4. Never merge multiple questions in assistant_message.
5. If relevant, extract the key information as collected_value.
6. If not relevant, set is_on_topic to false and gently redirect.
7. Infer likely_problem_type from conversation (cardiac, neuro, oncology, gastro, respiratory, ortho, derm, general, etc).
8. You may adapt your language to match the patient's language.
9. Keep responses concise and professional.
10. If detected_language differs from current, include it.

Respond in this exact JSON format:
{
  "assistant_message": "Your response to the patient",
  "is_on_topic": true/false,
  "collected_value": "extracted value or null",
  "answer_clarity": "clear|partial|unclear",
  "follow_up_question": "single follow-up question or null",
  "likely_problem_type": "domain label or null",
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
					retry_count: currentRetryCount,
					retry_limit: MAX_QUESTION_RETRIES,
					can_skip: false,
						next_question: null,
					},
				});
			}

			const warningMessage = `${getWarningMessage(
				streakResult.off_topic_streak,
				currentQuestion.question_text,
			)}\n\nWarning ${streakResult.off_topic_streak}/3.`;
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
					retry_count: currentRetryCount,
					retry_limit: MAX_QUESTION_RETRIES,
					can_skip: canSkipTextQuestion,
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

		const clarity = aiResponse.answer_clarity ?? "partial";
		if (clarity !== "clear") {
			const retryResult = await incrementCaseQuestionRetry({
				case_id: caseId,
				question_key: fieldKey,
				latest_answer: userMessage ?? "",
				latest_clarity: clarity,
				detected_problem_type: aiResponse.likely_problem_type,
			});
			const canSkipNow = retryResult.retry_count >= MAX_QUESTION_RETRIES;
			const followUpQuestion =
				aiResponse.follow_up_question?.trim() ||
				`Could you clarify this so I can capture it accurately: ${currentQuestion.question_text}`;
			const assistantFollowUp =
				`${followUpQuestion}${
					canSkipNow
						? "\n\nIf you'd prefer, you can now use Skip for this question."
						: ""
				}`;

			await appendChatMessage({
				case_id: caseId,
				role: "assistant",
				content: assistantFollowUp,
				question_id: currentQuestion.id,
			});

			return sendJsonApiResponse({
				success: true,
				code: 200,
				data: {
					assistant_message: assistantFollowUp,
					case_status: "in_progress",
					retry_count: retryResult.retry_count,
					retry_limit: MAX_QUESTION_RETRIES,
					can_skip: canSkipNow,
					next_question: {
						id: currentQuestion.id,
						question_text: currentQuestion.question_text,
						response_type: currentQuestion.response_type,
					},
				},
			});
		}

		// On-topic: advance to next question
		const advanceResult = await advanceCaseQuestion({
			case_id: caseId,
			collected_field_key: fieldKey,
			collected_field_value: {
				answer: aiResponse.collected_value ?? userMessage,
				clarity: "clear",
				retries_used: currentRetryCount,
				likely_problem_type: aiResponse.likely_problem_type,
			},
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
					retry_count: 0,
					retry_limit: MAX_QUESTION_RETRIES,
					can_skip: false,
					next_question: null,
				},
			});
		}

		const nextQ = advanceResult.next_question;
		const assistantMsg = nextQ
			? nextQ.question_text
			: "Thank you. Please continue.";

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
				retry_count: 0,
				retry_limit: MAX_QUESTION_RETRIES,
				can_skip: nextQ?.response_type === "file",
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
