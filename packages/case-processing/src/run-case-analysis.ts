import {
	getMedicalCaseForProcessing,
	saveCaseAnalysis,
	failCaseAnalysis,
	appendCaseEventLog,
	setCaseEmbeddingPending,
	markCaseEmbeddingSynced,
	markCaseEmbeddingFailed,
} from "@repo/database/actions/medical-case";
import { upsertCaseAnalysisEmbedding } from "@repo/supabase";

import { buildAnalysisPrompt } from "./build-analysis-prompt";
import { caseAnalysisOutputSchema } from "./analysis-schema";
import {
	DEFAULT_CASE_ANALYSIS_GEMINI_MODEL,
	DEFAULT_CASE_EMBEDDING_MODEL,
	DEFAULT_CASE_EMBEDDING_DIMENSIONS,
} from "./constants";

export interface RunCaseAnalysisArgs {
	case_id: string;
	trigger_run_id?: string | null;
}

export type RunCaseAnalysisResult =
	| { outcome: "completed" }
	| { outcome: "failed"; error: string }
	| { outcome: "missing" }
	| { outcome: "not_ready"; reason: string };

const callGeminiRest = async (args: {
	apiKey: string;
	model: string;
	prompt: string;
}): Promise<string> => {
	const url = new URL(
		`https://generativelanguage.googleapis.com/v1beta/models/${args.model}:generateContent`,
	);
	url.searchParams.set("key", args.apiKey);

	const body = {
		contents: [{ role: "user", parts: [{ text: args.prompt }] }],
		generationConfig: {
			temperature: 0.15,
			maxOutputTokens: 8192,
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
	return (
		parsed.candidates?.[0]?.content?.parts
			?.map((p) => p.text ?? "")
			.join("") ?? ""
	);
};

const callGeminiEmbedding = async (args: {
	apiKey: string;
	model: string;
	text: string;
}): Promise<number[]> => {
	const url = new URL(
		`https://generativelanguage.googleapis.com/v1beta/models/${args.model}:embedContent`,
	);
	url.searchParams.set("key", args.apiKey);

	const body = {
		model: `models/${args.model}`,
		content: { parts: [{ text: args.text }] },
	};

	const response = await fetch(url.toString(), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	const rawText = await response.text();
	if (!response.ok) {
		throw new Error(`Gemini Embedding API error (${response.status}): ${rawText.slice(0, 500)}`);
	}

	const parsed = JSON.parse(rawText) as {
		embedding?: { values?: number[] };
	};

	const values = parsed.embedding?.values;
	if (!values || !Array.isArray(values)) {
		throw new Error("No embedding values in Gemini response.");
	}

	return values;
};

export const runCaseAnalysis = async (
	args: RunCaseAnalysisArgs,
): Promise<RunCaseAnalysisResult> => {
	const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
	if (!apiKey) {
		throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required for case analysis.");
	}

	const analysisModel =
		process.env.GOOGLE_GENAI_CASE_ANALYSIS_MODEL?.trim() || DEFAULT_CASE_ANALYSIS_GEMINI_MODEL;
	const embeddingModel =
		process.env.GOOGLE_GENAI_EMBEDDING_MODEL?.trim() || DEFAULT_CASE_EMBEDDING_MODEL;
	const embeddingDimensions = DEFAULT_CASE_EMBEDDING_DIMENSIONS;

	const caseData = await getMedicalCaseForProcessing({ case_id: args.case_id });
	if (!caseData) {
		return { outcome: "missing" };
	}

	if (caseData.conversation_status !== "completed") {
		return { outcome: "not_ready", reason: "Chat is not completed yet." };
	}

	// Check if all text_report files are processed
	const pendingFiles = caseData.files.filter(
		(cf) =>
			cf.file.report_type === "text_report" &&
			cf.file.processing_status !== "completed" &&
			cf.file.processing_status !== "not_supported",
	);

	if (pendingFiles.length > 0) {
		return {
			outcome: "not_ready",
			reason: `${pendingFiles.length} file(s) still processing.`,
		};
	}

	const triggerRunId = args.trigger_run_id ?? undefined;

	await appendCaseEventLog({
		case_id: args.case_id,
		event_type: "analysis_started",
		metadata: { model: analysisModel, trigger_run_id: triggerRunId },
	});

	try {
		const patient = caseData.user.profile;
		if (!patient) {
			throw new Error("Patient profile not found.");
		}

		const fileSummaries = caseData.files
			.filter((cf) => cf.file.processed_data)
			.map((cf) => {
				const pd = cf.file.processed_data as Record<string, unknown> | null;
				return {
					filename: cf.file.filename,
					summary: pd?.summary ?? undefined,
					extracted_text:
						typeof pd?.extracted_text === "string"
							? pd.extracted_text
							: undefined,
				};
			});

		const prompt = buildAnalysisPrompt({
			patient: {
				name: patient.name,
				age: patient.age,
				gender: patient.gender,
				email: patient.email,
				country: patient.country,
			},
			messages: caseData.chat_messages.map((m) => ({
				role: m.role as "assistant" | "user",
				content: m.content,
			})),
			collected_data: (caseData.collected_data as Record<string, unknown>) ?? {},
			file_summaries: fileSummaries,
		});

		const rawAnalysis = await callGeminiRest({
			apiKey,
			model: analysisModel,
			prompt,
		});

		let analysisJson: unknown;
		try {
			analysisJson = JSON.parse(rawAnalysis.trim());
		} catch {
			const fenceMatch = rawAnalysis.match(/```(?:json)?\s*([\s\S]*?)```/i);
			if (fenceMatch?.[1]) {
				analysisJson = JSON.parse(fenceMatch[1].trim());
			} else {
				throw new Error("Failed to parse analysis JSON from Gemini response.");
			}
		}

		const validated = caseAnalysisOutputSchema.parse(analysisJson);

		await saveCaseAnalysis({
			case_id: args.case_id,
			detected_specialty: validated.detected_specialty ?? undefined,
			urgency_level: validated.urgency_level ?? undefined,
			ai_confidence: validated.ai_confidence ?? undefined,
			key_symptoms: validated.key_symptoms as unknown,
			ai_summary: validated.ai_summary,
			collected_information: validated.collected_information as unknown,
			gemini_model: analysisModel,
			trigger_run_id: triggerRunId,
		});

		try {
			await setCaseEmbeddingPending({
				case_id: args.case_id,
				trigger_run_id: triggerRunId,
			});

			const embeddingText = [
				validated.ai_summary,
				validated.detected_specialty ?? "",
				...(validated.key_symptoms?.map((s) => s.description) ?? []),
			]
				.filter(Boolean)
				.join(". ");

			const embeddingValues = await callGeminiEmbedding({
				apiKey,
				model: embeddingModel,
				text: embeddingText,
			});

			const upsertResult = await upsertCaseAnalysisEmbedding({
				caseId: args.case_id,
				embedding: embeddingValues,
				model: embeddingModel,
				expectedDimensions: embeddingDimensions,
			});

			if (!upsertResult.ok) {
				await markCaseEmbeddingFailed({
					case_id: args.case_id,
					error_message: upsertResult.error,
					trigger_run_id: triggerRunId,
				});
			} else {
				await markCaseEmbeddingSynced({
					case_id: args.case_id,
					model: embeddingModel,
					dimensions: embeddingDimensions,
					trigger_run_id: triggerRunId,
				});
			}
		} catch (embError) {
			const embMsg = embError instanceof Error ? embError.message : String(embError);
			await markCaseEmbeddingFailed({
				case_id: args.case_id,
				error_message: embMsg,
				trigger_run_id: triggerRunId,
			});
		}

		return { outcome: "completed" };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		await failCaseAnalysis({
			case_id: args.case_id,
			error_message: message,
			trigger_run_id: triggerRunId,
		});
		return { outcome: "failed", error: message };
	}
};
