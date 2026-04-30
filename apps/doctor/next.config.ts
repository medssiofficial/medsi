import type { NextConfig } from "next";
import { withSentryNextConfig } from "@repo/sentry/next-config";

const nextConfig: NextConfig = {
	transpilePackages: ["@repo/ui", "@repo/database", "@repo/sentry"],
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default withSentryNextConfig(nextConfig);
