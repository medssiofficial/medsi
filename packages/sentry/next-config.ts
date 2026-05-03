import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import { isSentryBuildTimeEnabled } from "./runtime-enabled";

interface SentryNextConfigOptions {
	org?: string;
	project?: string;
	authToken?: string;
	silent?: boolean;
}

export const withSentryNextConfig = (
	nextConfig: NextConfig,
	options: SentryNextConfigOptions = {},
): NextConfig => {
	if (!isSentryBuildTimeEnabled()) {
		return nextConfig;
	}

	return withSentryConfig(nextConfig, {
		org: options.org ?? process.env.SENTRY_ORG,
		project: options.project ?? process.env.SENTRY_PROJECT,
		authToken: options.authToken ?? process.env.SENTRY_AUTH_TOKEN,
		silent: options.silent ?? !process.env.CI,
		tunnelRoute: "/sentry-tunnel",
		widenClientFileUpload: true,
		disableLogger: true,
		automaticVercelMonitors: false,
	});
};
