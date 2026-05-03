import { getDoctorEmbeddingSourceById } from "@repo/database/actions/doctor";
import {
	appendDoctorEmbeddingLog,
	markDoctorEmbeddingFailed,
	markDoctorEmbeddingSynced,
	setDoctorEmbeddingPending,
} from "@repo/database/actions/doctor-embedding";
import { DOCTOR_EMBEDDING_VECTOR_DIMENSION } from "@repo/database/constants/doctor-embedding";
import { sendDoctorEmbeddingFailedAlert } from "@repo/email";
import { upsertDoctorProfileEmbedding } from "@repo/supabase";
import { task, tasks } from "@trigger.dev/sdk";
import z from "zod";

import { getAdminRecipientEmailsFromClerk } from "../../lib/admin-embedding-emails";
import { buildDoctorEmbeddingText, embedText } from "../../integrations/google-ai";

const payloadSchema = z.object({
	doctorId: z.string().min(1),
	source: z.enum(["approval", "manual", "bulk"]),
});

const formatError = (error: unknown) =>
	error instanceof Error ? error.message : String(error);

tasks.onFailure(async ({ payload, error, ctx, task: taskId }) => {
	const isDoctorEmbedTask =
		taskId === "admin-doctor-embed" || taskId.endsWith("/admin-doctor-embed");
	if (!isDoctorEmbedTask) {
		return;
	}

	const parsed = payloadSchema.safeParse(payload);
	if (!parsed.success) {
		return;
	}

	const { doctorId, source } = parsed.data;
	const message = formatError(error);
	const runId = ctx.run.id;

	await markDoctorEmbeddingFailed({
		doctor_id: doctorId,
		error_message: message,
		trigger_run_id: runId,
	});

	await appendDoctorEmbeddingLog({
		doctor_id: doctorId,
		source,
		outcome: "failure",
		error_message: message,
		trigger_run_id: runId,
	});

	let doctorName: string | undefined;
	try {
		const row = await getDoctorEmbeddingSourceById({ id: doctorId });
		doctorName = row?.profile?.name ?? undefined;
	} catch {
		doctorName = undefined;
	}

	const recipients = await getAdminRecipientEmailsFromClerk();
	if (recipients.length === 0) {
		return;
	}

	await sendDoctorEmbeddingFailedAlert({
		recipients,
		doctorId,
		doctorName,
		errorMessage: message,
		source,
		triggerRunId: runId,
	});
});

export const doctorEmbeddingTask = task({
	id: "admin-doctor-embed",
	run: async (
		payload: unknown,
		{ ctx }: { ctx: { run: { id: string } } },
	) => {
		const { doctorId, source } = payloadSchema.parse(payload);
		const runId = ctx.run.id;

		await setDoctorEmbeddingPending({
			doctor_id: doctorId,
			trigger_run_id: runId,
		});

		const row = await getDoctorEmbeddingSourceById({ id: doctorId });
		if (!row) {
			throw new Error(`Doctor not found: ${doctorId}`);
		}
		if (!row.profile) {
			throw new Error(`Doctor profile missing for embedding: ${doctorId}`);
		}

		const text = buildDoctorEmbeddingText(row);
		const { embedding, model } = await embedText(text);

		const vectorResult = await upsertDoctorProfileEmbedding({
			doctorId,
			embedding,
			model,
			expectedDimensions: DOCTOR_EMBEDDING_VECTOR_DIMENSION,
		});

		if (!vectorResult.ok) {
			throw new Error(vectorResult.error);
		}

		await markDoctorEmbeddingSynced({
			doctor_id: doctorId,
			model,
			dimensions: embedding.length,
			trigger_run_id: runId,
		});

		await appendDoctorEmbeddingLog({
			doctor_id: doctorId,
			source,
			outcome: "success",
			embedding_model: model,
			dimensions: embedding.length,
			trigger_run_id: runId,
			metadata: {
				vectorDimensions: embedding.length,
			},
		});

		return {
			doctorId: row.id,
			model,
			dimensions: embedding.length,
		};
	},
});
