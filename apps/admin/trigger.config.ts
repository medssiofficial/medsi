import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { defineConfig } from "@trigger.dev/sdk";

/**
 * Trigger.dev worker for the admin app.
 *
 * - Tasks live under `./trigger` (see `dirs`).
 * - `runtime: "bun"` matches this monorepo.
 * - Prisma uses **modern** mode (Prisma 7 + `prisma-client` in `@repo/database`).
 *   Run `bun --cwd ../../packages/database run db:generate` before `trigger deploy`
 *   so the generated client is present for the worker bundle.
 * - Add more build extensions here as you integrate `@repo/supabase` or other packages.
 */
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
