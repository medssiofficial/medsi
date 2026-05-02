import * as Sentry from "@sentry/nextjs";
import { isSentryRuntimeInitEnabled } from "./runtime-enabled";

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
