import { getDoctorEmbeddingSourceById } from "@repo/database/actions/doctor";
import { task } from "@trigger.dev/sdk";
import z from "zod";

import { buildDoctorEmbeddingText, embedText } from "../../integrations/google-ai";

const payloadSchema = z.object({
	doctorId: z.string().min(1),
});

export const doctorEmbeddingTask = task({
	id: "admin-doctor-embed",
	run: async (payload: unknown) => {
		const { doctorId } = payloadSchema.parse(payload);

		const row = await getDoctorEmbeddingSourceById({ id: doctorId });
		if (!row) {
			throw new Error(`Doctor not found: ${doctorId}`);
		}
		if (!row.profile) {
			throw new Error(`Doctor profile missing for embedding: ${doctorId}`);
		}

		const text = buildDoctorEmbeddingText(row);
		const { embedding, model } = await embedText(text);

		return {
			doctorId: row.id,
			model,
			dimensions: embedding.length,
			embedding,
		};
	},
});
