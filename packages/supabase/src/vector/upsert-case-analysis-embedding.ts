import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseServiceClient } from "../client/supabase-client";

const TABLE = "case_analysis_embeddings";

export interface UpsertCaseAnalysisEmbeddingArgs {
	caseId: string;
	embedding: number[];
	model: string;
	expectedDimensions: number;
}

export type UpsertCaseAnalysisEmbeddingResult =
	| { ok: true }
	| { ok: false; error: string };

export const upsertCaseAnalysisEmbedding = async (
	args: UpsertCaseAnalysisEmbeddingArgs,
): Promise<UpsertCaseAnalysisEmbeddingResult> => {
	const rawClient = getSupabaseServiceClient();
	if (!rawClient) {
		return {
			ok: false,
			error: "Supabase service client is not configured (URL or secret key missing).",
		};
	}

	if (args.embedding.length !== args.expectedDimensions) {
		return {
			ok: false,
			error: `Embedding length ${args.embedding.length} does not match expected ${args.expectedDimensions}.`,
		};
	}

	const supabase = rawClient as unknown as SupabaseClient;

	const { error } = await supabase.from(TABLE).upsert(
		{
			case_id: args.caseId,
			embedding: args.embedding,
			model: args.model,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: "case_id" },
	);

	if (error) {
		return { ok: false, error: error.message };
	}

	return { ok: true };
};
