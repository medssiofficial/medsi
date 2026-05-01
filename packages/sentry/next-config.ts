import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

interface SentryNextConfigOptions {
	org?: string;
	project?: string;
	authToken?: string;
	silent?: boolean;
}

/**
 * Wraps a Next.js config with Sentry build-time tooling:
 * source map upload, tunnel route, and tree-shaking of unused Sentry code.
 *
 * Sentry is only activated when NEXT_PUBLIC_SENTRY_ENABLED=true is set.
 * Omitting it (e.g. in the global `bun dev` shortcut) keeps Turbopack enabled
 * and skips the Sentry webpack plugin entirely, making cold-starts much faster.
 *
 * SENTRY_ORG, SENTRY_PROJECT and SENTRY_AUTH_TOKEN are read from the process
 * environment at build time (CI / local .env). They do NOT need to be in
 * runtime env schema since they are consumed only by the webpack plugin.
 */
export const withSentryNextConfig = (
	nextConfig: NextConfig,
	options: SentryNextConfigOptions = {},
): NextConfig => {
	if (process.env.NEXT_PUBLIC_SENTRY_ENABLED !== "true") {
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
