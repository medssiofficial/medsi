import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
	project: "proj_hmexbevoaatirfheayli",
	runtime: "bun",
	dirs: ["./trigger"],
	retries: {
		enabledInDev: false,
		default: {
			maxAttempts: 3,
			minTimeoutInMs: 1000,
			maxTimeoutInMs: 10000,
			factor: 2,
			randomize: true,
		},
	},
	maxDuration: 3600,
	build: {
		extensions: [
			prismaExtension({
				mode: "modern",
			}),
		],
	},
});
