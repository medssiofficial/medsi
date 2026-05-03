import * as Sentry from "@sentry/nextjs";
import { isSentryDeploymentEligible } from "@repo/sentry/runtime-enabled";

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		void import("@repo/database/ensure-doctor-embedding-vector-table")
			.then(({ ensureDoctorEmbeddingVectorTable }) =>
				ensureDoctorEmbeddingVectorTable(),
			)
			.catch((error: unknown) => {
				console.error(
					"[medssi] Failed to ensure doctor embedding vector table",
					error,
				);
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
