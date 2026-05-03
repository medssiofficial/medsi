import * as Sentry from "@sentry/nextjs";
import { isSentryRuntimeInitEnabled } from "./runtime-enabled";

export const initSentryClient = (dsn: string): void => {
	if (!isSentryRuntimeInitEnabled(dsn)) return;

	Sentry.init({
		dsn,
		environment: process.env.NODE_ENV,
		tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
		sendDefaultPii: true,
		enableLogs: true,
		integrations: [
			Sentry.consoleLoggingIntegration({
				levels: ["log", "info", "warn", "error", "debug"],
			}),
		],
		beforeSendLog(log) {
			if (process.env.NODE_ENV === "production" && log.level === "debug") {
				return null;
			}
			return log;
		},
	});
};

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
