import { DOCTOR_EMBEDDING_VECTOR_DIMENSION } from "@repo/database/constants/doctor-embedding";

import { createGoogleGenAiClient } from "./client";
import { getGoogleGenAiEmbeddingModel } from "./config";

export interface EmbedTextResult {
	embedding: number[];
	model: string;
}

export async function embedText(text: string): Promise<EmbedTextResult> {
	const trimmed = text.trim();
	if (!trimmed) {
		throw new Error("Cannot embed empty text");
	}

	const model = getGoogleGenAiEmbeddingModel();
	const ai = createGoogleGenAiClient();
	const response = await ai.models.embedContent({
		model,
		contents: trimmed,
		config: {
			outputDimensionality: DOCTOR_EMBEDDING_VECTOR_DIMENSION,
		},
	});

	const values = response.embeddings?.[0]?.values;
	if (!values?.length) {
		throw new Error("Google GenAI embedContent returned no embedding vector");
	}

	return { embedding: values, model };
}
