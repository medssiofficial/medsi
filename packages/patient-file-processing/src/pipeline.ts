import { Buffer } from "node:buffer";
import {
	DEFAULT_PATIENT_FILE_GEMINI_MODEL,
	PATIENT_FILE_MAX_INLINE_PDF_BYTES,
	PATIENT_FILE_MAX_STORED_EXTRACTED_CHARS,
	PATIENT_FILE_MERGE_BATCH,
	PATIENT_FILE_TEXT_CHUNK_CHARS,
} from "./constants";
import { callGeminiGenerateContent, parseJsonObjectFromModelText } from "./gemini-rest";
import {
	patientFileChunkPartialSchema,
	patientFileFinalSummarySchema,
	type PatientFileChunkPartial,
	type PatientFileFinalSummary,
} from "./summary-schema";

const decoder = new TextDecoder("utf-8", { fatal: false });

export const decodeBytesToUtf8 = (bytes: Uint8Array) => decoder.decode(bytes);

const chunkUtf16Safe = (text: string, maxChars: number): string[] => {
	if (text.length <= maxChars) return [text];
	const out: string[] = [];
	for (let i = 0; i < text.length; i += maxChars) {
		out.push(text.slice(i, i + maxChars));
	}
	return out;
};

const summarizeChunk = async (args: {
	apiKey: string;
	model: string;
	chunkIndex: number;
	chunkTotal: number;
	text: string;
}): Promise<PatientFileChunkPartial> => {
	const prompt = `You are a clinical documentation assistant. Read the following excerpt (part ${
		args.chunkIndex + 1
	} of ${args.chunkTotal}) from a patient file. It may be in any language.

Return ONLY valid JSON matching this shape (no markdown):
{"key_points": string[], "named_entities"?: string[]}

Rules:
- key_points: concise clinical facts, tests, impressions, instructions found in this excerpt only.
- named_entities: optional important names, facilities, drug names if present.

Excerpt:
---
${args.text}
---`;

	const raw = await callGeminiGenerateContent({
		apiKey: args.apiKey,
		model: args.model,
		parts: [{ text: prompt }],
		responseMimeType: "application/json",
		maxOutputTokens: 4096,
	});

	const parsed = patientFileChunkPartialSchema.safeParse(
		parseJsonObjectFromModelText(raw),
	);
	if (!parsed.success) {
		throw new Error(`Invalid chunk summary JSON for chunk ${args.chunkIndex + 1}`);
	}
	return parsed.data;
};

const mergeChunkPartialsBatch = async (args: {
	apiKey: string;
	model: string;
	partials: PatientFileChunkPartial[];
}): Promise<PatientFileChunkPartial> => {
	const prompt = `Merge these JSON digests from different parts of the same patient document into one JSON digest.
Return ONLY valid JSON: {"key_points": string[], "named_entities"?: string[]}
Deduplicate, preserve clinical meaning, keep multilingual terms as-is.

Digests:
${JSON.stringify(args.partials)}`;

	const raw = await callGeminiGenerateContent({
		apiKey: args.apiKey,
		model: args.model,
		parts: [{ text: prompt }],
		responseMimeType: "application/json",
		maxOutputTokens: 4096,
	});

	const parsed = patientFileChunkPartialSchema.safeParse(
		parseJsonObjectFromModelText(raw),
	);
	if (!parsed.success) {
		throw new Error("Invalid merged digest JSON");
	}
	return parsed.data;
};

const hierarchicalMergePartials = async (args: {
	apiKey: string;
	model: string;
	partials: PatientFileChunkPartial[];
}): Promise<PatientFileChunkPartial> => {
	let level = [...args.partials];
	while (level.length > 1) {
		const next: PatientFileChunkPartial[] = [];
		for (let i = 0; i < level.length; i += PATIENT_FILE_MERGE_BATCH) {
			const batch = level.slice(i, i + PATIENT_FILE_MERGE_BATCH);
			next.push(
				await mergeChunkPartialsBatch({
					apiKey: args.apiKey,
					model: args.model,
					partials: batch,
				}),
			);
		}
		level = next;
	}
	return level[0] ?? { key_points: [] };
};

const buildFinalSummary = async (args: {
	apiKey: string;
	model: string;
	digest: PatientFileChunkPartial;
	textSample: string;
}): Promise<PatientFileFinalSummary> => {
	const prompt = `You are a clinical documentation assistant. Using the digest JSON and a short text sample from the same document, produce a structured summary for the patient file viewer.
The source may be multilingual; keep important untranslated terms when needed but you may use English for the summary fields.

Digest:
${JSON.stringify(args.digest)}

Text sample (may be truncated):
---
${args.textSample.slice(0, 30_000)}
---

Return ONLY valid JSON matching exactly:
{
  "title": string,
  "language_detected"?: string,
  "key_findings": string[],
  "possible_diagnoses_or_conditions": string[],
  "medications_or_treatments_mentioned": string[],
  "dates_and_follow_up": string[],
  "patient_actions_recommended": string[],
  "confidence_notes"?: string
}`;

	const raw = await callGeminiGenerateContent({
		apiKey: args.apiKey,
		model: args.model,
		parts: [{ text: prompt }],
		responseMimeType: "application/json",
		maxOutputTokens: 8192,
	});

	const parsed = patientFileFinalSummarySchema.safeParse(
		parseJsonObjectFromModelText(raw),
	);
	if (!parsed.success) {
		throw new Error("Invalid final summary JSON");
	}
	return parsed.data;
};

const summarizePdfInline = async (args: {
	apiKey: string;
	model: string;
	pdfBytes: Uint8Array;
}): Promise<{ summary: PatientFileFinalSummary; extracted_text: string }> => {
	if (args.pdfBytes.byteLength > PATIENT_FILE_MAX_INLINE_PDF_BYTES) {
		throw new Error("PDF is too large for inline processing.");
	}

	const base64 = Buffer.from(args.pdfBytes).toString("base64");

	const prompt = `The attached PDF is a patient medical document. It may be multilingual.

Return ONLY valid JSON with this exact shape:
{
  "title": string,
  "language_detected"?: string,
  "key_findings": string[],
  "possible_diagnoses_or_conditions": string[],
  "medications_or_treatments_mentioned": string[],
  "dates_and_follow_up": string[],
  "patient_actions_recommended": string[],
  "confidence_notes"?: string,
  "extracted_text": string
}

extracted_text: include as much legible document text as you can (OCR/transcription). If impossibly long, include the longest practical excerpt and note truncation in confidence_notes.`;

	const raw = await callGeminiGenerateContent({
		apiKey: args.apiKey,
		model: args.model,
		parts: [
			{
				inlineData: {
					mimeType: "application/pdf",
					data: base64,
				},
			},
			{ text: prompt },
		],
		responseMimeType: "application/json",
		maxOutputTokens: 8192,
	});

	const obj = parseJsonObjectFromModelText(raw);
	if (!obj || typeof obj !== "object") {
		throw new Error("Invalid PDF processing JSON");
	}

	const record = obj as Record<string, unknown>;
	const { extracted_text: extractedTextRaw, ...summaryFields } = record;
	const summaryParsed = patientFileFinalSummarySchema.safeParse(summaryFields);
	if (!summaryParsed.success) {
		throw new Error("Invalid PDF summary JSON");
	}

	const extracted =
		typeof extractedTextRaw === "string"
			? extractedTextRaw
			: typeof extractedTextRaw === "number"
				? String(extractedTextRaw)
				: "";

	return {
		summary: summaryParsed.data,
		extracted_text: extracted,
	};
};

export interface ProcessedPatientFilePayload {
	version: 1;
	model: string;
	summary: PatientFileFinalSummary;
	extracted_text: string;
	extracted_text_truncated: boolean;
	chunk_count?: number;
	source_mime_type: string;
}

export const buildProcessedPayload = (args: {
	model: string;
	summary: PatientFileFinalSummary;
	extracted_text: string;
	mime_type: string;
	chunk_count?: number;
}): ProcessedPatientFilePayload => {
	let text = args.extracted_text;
	let truncated = false;
	if (text.length > PATIENT_FILE_MAX_STORED_EXTRACTED_CHARS) {
		text = text.slice(0, PATIENT_FILE_MAX_STORED_EXTRACTED_CHARS);
		truncated = true;
	}
	return {
		version: 1,
		model: args.model,
		summary: args.summary,
		extracted_text: text,
		extracted_text_truncated: truncated,
		...(typeof args.chunk_count === "number" ? { chunk_count: args.chunk_count } : {}),
		source_mime_type: args.mime_type,
	};
};

export const runTextPipeline = async (args: {
	apiKey: string;
	model?: string;
	fullText: string;
	mime_type: string;
}): Promise<ProcessedPatientFilePayload> => {
	const model = args.model?.trim() || DEFAULT_PATIENT_FILE_GEMINI_MODEL;
	const chunks = chunkUtf16Safe(args.fullText, PATIENT_FILE_TEXT_CHUNK_CHARS);
	const partials: PatientFileChunkPartial[] = [];

	for (let i = 0; i < chunks.length; i++) {
		partials.push(
			await summarizeChunk({
				apiKey: args.apiKey,
				model,
				chunkIndex: i,
				chunkTotal: chunks.length,
				text: chunks[i] ?? "",
			}),
		);
	}

	const digest =
		partials.length === 1
			? (partials[0] ?? { key_points: [] })
			: await hierarchicalMergePartials({
					apiKey: args.apiKey,
					model,
					partials,
				});

	const summary = await buildFinalSummary({
		apiKey: args.apiKey,
		model,
		digest,
		textSample: args.fullText.slice(0, 50_000),
	});

	return buildProcessedPayload({
		model,
		summary,
		extracted_text: args.fullText,
		mime_type: args.mime_type,
		chunk_count: chunks.length,
	});
};

export const runPdfPipeline = async (args: {
	apiKey: string;
	model?: string;
	pdfBytes: Uint8Array;
	mime_type: string;
}): Promise<ProcessedPatientFilePayload> => {
	const model = args.model?.trim() || DEFAULT_PATIENT_FILE_GEMINI_MODEL;
	const { summary, extracted_text } = await summarizePdfInline({
		apiKey: args.apiKey,
		model,
		pdfBytes: args.pdfBytes,
	});

	return buildProcessedPayload({
		model,
		summary,
		extracted_text,
		mime_type: args.mime_type,
	});
};
