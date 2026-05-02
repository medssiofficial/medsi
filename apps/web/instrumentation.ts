import * as Sentry from "@sentry/nextjs";
import { isSentryDeploymentEligible } from "@repo/sentry/runtime-enabled";

export async function register() {
	if (!isSentryDeploymentEligible()) return;

	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("./sentry.server.config");
	}

	if (process.env.NEXT_RUNTIME === "edge") {
		await import("./sentry.edge.config");
	}
}

export const onRequestError = Sentry.captureRequestError;
