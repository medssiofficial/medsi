import * as Sentry from "@sentry/nextjs";
import { ensureDoctorEmbeddingVectorTable } from "@repo/database/ensure-doctor-embedding-vector-table";
import { isSentryDeploymentEligible } from "@repo/sentry/runtime-enabled";

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		void ensureDoctorEmbeddingVectorTable().catch((error) => {
			console.error("[medssi] Failed to ensure doctor embedding vector table", error);
		});
	}

	if (!isSentryDeploymentEligible()) return;

	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("./sentry.server.config");
	}

	if (process.env.NEXT_RUNTIME === "edge") {
		await import("./sentry.edge.config");
	}
}

export const onRequestError = Sentry.captureRequestError;
