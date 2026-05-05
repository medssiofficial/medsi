import { runPatientFileProcessing } from "@repo/patient-file-processing";
import { task } from "@trigger.dev/sdk";
import { z } from "zod";

const payloadSchema = z.object({
	fileId: z.string().min(1),
	source: z.enum([
		"patient_upload",
		"patient_manual",
		"patient_bulk",
		"admin_manual",
		"admin_bulk",
	]),
});

export const patientFileProcessTask = task({
	id: "web-patient-file-process",
	run: async (
		payload: unknown,
		{ ctx }: { ctx: { run: { id: string } } },
	) => {
		const parsed = payloadSchema.parse(payload);
		await runPatientFileProcessing({
			file_id: parsed.fileId,
			source: parsed.source,
			trigger_run_id: ctx.run.id,
		});
	},
});
