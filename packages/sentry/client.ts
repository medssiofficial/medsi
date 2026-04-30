import * as Sentry from "@sentry/nextjs";

/**
 * Initialises Sentry for the browser runtime.
 * Call this at the top of `instrumentation-client.ts` in each Next.js app.
 */
export const initSentryClient = (dsn: string): void => {
	if (!dsn || process.env.NEXT_PUBLIC_SENTRY_ENABLED !== "true") return;

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
