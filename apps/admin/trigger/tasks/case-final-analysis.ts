import { runCaseAnalysis } from "@repo/case-processing";
import { task } from "@trigger.dev/sdk";
import { z } from "zod";

const payloadSchema = z.object({
	caseId: z.string().min(1),
});

export const adminCaseFinalAnalysisTask = task({
	id: "admin-case-final-analysis",
	retry: {
		maxAttempts: 3,
		minTimeoutInMs: 5000,
		maxTimeoutInMs: 30000,
		factor: 2,
	},
	run: async (
		payload: unknown,
		{ ctx }: { ctx: { run: { id: string } } },
	) => {
		const parsed = payloadSchema.parse(payload);
		const result = await runCaseAnalysis({
			case_id: parsed.caseId,
			trigger_run_id: ctx.run.id,
		});

		if (result.outcome === "failed") {
			throw new Error(result.error);
		}

		if (result.outcome === "not_ready") {
			throw new Error(`Case not ready: ${result.reason}`);
		}
	},
});
