import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseServiceClient } from "../client/supabase-client";

const TABLE = "doctor_profile_embeddings";

export interface UpsertDoctorProfileEmbeddingArgs {
	doctorId: string;
	embedding: number[];
	model: string;
	expectedDimensions: number;
}

export type UpsertDoctorProfileEmbeddingResult =
	| { ok: true }
	| { ok: false; error: string };

export const upsertDoctorProfileEmbedding = async (
	args: UpsertDoctorProfileEmbeddingArgs,
): Promise<UpsertDoctorProfileEmbeddingResult> => {
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

	const payload = {
		doctor_id: args.doctorId,
		embedding: args.embedding,
		model: args.model,
		updated_at: new Date().toISOString(),
	};

	const { data, error } = await supabase
		.from(TABLE)
		.upsert(payload, { onConflict: "doctor_id" })
		.select("doctor_id")
		.maybeSingle();

	if (error) {
		return { ok: false, error: error.message };
	}

	// Guardrail: treat missing returned row as failed persistence.
	if (!data || data.doctor_id !== args.doctorId) {
		return {
			ok: false,
			error: "Vector upsert did not return a persisted doctor_id row.",
		};
	}

	return { ok: true };
};
