import * as Sentry from "@sentry/nextjs";
import { isSentryRuntimeInitEnabled } from "./runtime-enabled";

/**
 * Initialises Sentry for the Edge runtime.
 * Call this at the top of `sentry.edge.config.ts` in each Next.js app.
 */
export const initSentryEdge = (dsn: string): void => {
	if (!isSentryRuntimeInitEnabled(dsn)) return;

	Sentry.init({
		dsn,
		environment: process.env.NODE_ENV,
		tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
		sendDefaultPii: true,
		enableLogs: true,
	});
};
