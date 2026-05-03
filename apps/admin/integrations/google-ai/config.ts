const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-2-preview";

export function getGoogleGenAiApiKey(): string {
	const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
	if (!key) {
		throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required for Google GenAI");
	}
	return key;
}

export function getGoogleGenAiEmbeddingModel(): string {
	const model = process.env.GOOGLE_GENAI_EMBEDDING_MODEL?.trim();
	return model && model.length > 0 ? model : DEFAULT_EMBEDDING_MODEL;
}
