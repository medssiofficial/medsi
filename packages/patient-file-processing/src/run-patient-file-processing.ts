import {
	completePatientFileProcessing,
	failPatientFileProcessing,
	preparePatientFileForProcessing,
} from "@repo/database/actions/patient-file-processing";
import type { PatientFileProcessingSource, Prisma } from "@repo/database/types/server";
import { sendPatientFileProcessingFailedNotice } from "@repo/email";
import { downloadStorageObject } from "@repo/supabase";

import { DEFAULT_PATIENT_FILE_GEMINI_MODEL } from "./constants";
import { decodeBytesToUtf8, runPdfPipeline, runTextPipeline } from "./pipeline";

const resolveBucketFromMetadata = (metadata: unknown): string | undefined => {
	if (!metadata || typeof metadata !== "object") return undefined;
	const bucket = (metadata as { bucket?: unknown }).bucket;
	return typeof bucket === "string" && bucket.trim().length > 0 ? bucket.trim() : undefined;
};

const shouldEmailPatient = (source: PatientFileProcessingSource) =>
	source === "patient_upload" ||
	source === "patient_manual" ||
	source === "patient_bulk" ||
	source === "admin_manual" ||
	source === "admin_bulk";

const notifyPatientFailure = async (args: {
	source: PatientFileProcessingSource;
	email: string | null | undefined;
	filename: string;
	fileId: string;
	message: string;
	triggerRunId?: string | null;
}) => {
	if (!shouldEmailPatient(args.source)) return;
	const email = args.email?.trim();
	if (!email) return;

	await sendPatientFileProcessingFailedNotice({
		to: email,
		filename: args.filename,
		fileId: args.fileId,
		errorMessage: args.message,
		source: args.source,
		triggerRunId: args.triggerRunId ?? undefined,
	});
};

export interface RunPatientFileProcessingArgs {
	file_id: string;
	source: PatientFileProcessingSource;
	trigger_run_id?: string | null;
}

export type RunPatientFileProcessingResult =
	| { outcome: "missing" }
	| { outcome: "image_not_supported" }
	| { outcome: "skipped"; reason: string }
	| { outcome: "completed" }
	| { outcome: "failed"; error: string };

export const runPatientFileProcessing = async (
	args: RunPatientFileProcessingArgs,
): Promise<RunPatientFileProcessingResult> => {
	const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
	if (!apiKey) {
		throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required for patient file processing.");
	}

	const primaryModel =
		process.env.GOOGLE_GENAI_PATIENT_FILE_MODEL?.trim() || DEFAULT_PATIENT_FILE_GEMINI_MODEL;
	const fallbackModels = (process.env.GOOGLE_GENAI_PATIENT_FILE_FALLBACK_MODELS ?? "")
		.split(",")
		.map((m) => m.trim())
		.filter(Boolean);
	const modelCandidates = [primaryModel, ...fallbackModels].filter(
		(model, index, arr) => arr.indexOf(model) === index,
	);

	const isTransientGeminiError = (message: string) =>
		/Gemini API error \((429|500|502|503|504)\)/.test(message);

	const runWithModelFallback = async (bytes: Uint8Array, mimeType: string) => {
		let lastError: Error | null = null;

		for (const model of modelCandidates) {
			// Retry transient rate-limit/capacity errors once on same model.
			for (let attempt = 1; attempt <= 2; attempt++) {
				try {
					const mime = mimeType.toLowerCase();
					return mime === "application/pdf" || mime.includes("pdf")
						? await runPdfPipeline({
								apiKey,
								model,
								pdfBytes: bytes,
								mime_type: mimeType,
							})
						: await runTextPipeline({
								apiKey,
								model,
								fullText: decodeBytesToUtf8(bytes),
								mime_type: mimeType,
							});
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error);
					lastError = error instanceof Error ? error : new Error(message);
					if (!isTransientGeminiError(message) || attempt === 2) {
						break;
					}
					await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
				}
			}
		}

		throw lastError ?? new Error("Patient file processing failed.");
	};

	const prepared = await preparePatientFileForProcessing({
		file_id: args.file_id,
		source: args.source,
		trigger_run_id: args.trigger_run_id,
	});

	if (prepared.status === "missing") return { outcome: "missing" };
	if (prepared.status === "image_not_supported") return { outcome: "image_not_supported" };
	if (prepared.status === "skipped") {
		return { outcome: "skipped", reason: prepared.reason };
	}

	const file = prepared.file;
	const patientEmail = file.user.profile?.email;

	const bucket = resolveBucketFromMetadata(file.metadata);
	const download = await downloadStorageObject({
		path: file.storage_key,
		bucket,
	});

	if (!download.success) {
		const message = download.error ?? "Download failed.";
		await failPatientFileProcessing({
			file_id: file.id,
			error_message: message,
			source: args.source,
			trigger_run_id: args.trigger_run_id,
			gemini_model: primaryModel,
			metadata: { stage: "download" },
		});
		await notifyPatientFailure({
			source: args.source,
			email: patientEmail,
			filename: file.filename,
			fileId: file.id,
			message,
			triggerRunId: args.trigger_run_id,
		});
		return { outcome: "failed", error: message };
	}

	try {
		const payload = await runWithModelFallback(download.data, file.mime_type);

		await completePatientFileProcessing({
			file_id: file.id,
			processed_data: payload as unknown as Prisma.InputJsonValue,
			gemini_model: payload.model,
			source: args.source,
			trigger_run_id: args.trigger_run_id,
			metadata: {
				chunk_count: payload.chunk_count ?? null,
				extracted_text_truncated: payload.extracted_text_truncated,
			},
		});

		return { outcome: "completed" };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		await failPatientFileProcessing({
			file_id: file.id,
			error_message: message,
			source: args.source,
			trigger_run_id: args.trigger_run_id,
			gemini_model: primaryModel,
			metadata: { stage: "processing", models_tried: modelCandidates },
		});
		await notifyPatientFailure({
			source: args.source,
			email: patientEmail,
			filename: file.filename,
			fileId: file.id,
			message,
			triggerRunId: args.trigger_run_id,
		});
		return { outcome: "failed", error: message };
	}
};
