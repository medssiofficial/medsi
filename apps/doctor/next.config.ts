import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@repo/ui", "@repo/database"],
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
