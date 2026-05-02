import type { NextConfig } from "next";
import { withSentryNextConfig } from "@repo/sentry/next-config";

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "",
	},
	transpilePackages: ["@repo/ui", "@repo/sentry"],
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default withSentryNextConfig(nextConfig);
