import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@repo/utils"],
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
