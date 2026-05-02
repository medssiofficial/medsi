import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

const optionalNonEmpty = z
	.string()
	.optional()
	.transform((v) => (v === "" ? undefined : v));

export const SERVER_ENV = createEnv({
	server: {
		CLERK_SECRET_KEY: z.string(),
		HOST: z.string(),
		/** Dev secret from Trigger.dev project → API Keys (local + self-hosted). */
		TRIGGER_SECRET_KEY: optionalNonEmpty,
		/** Optional; cloud default if unset. Self-hosted Trigger.dev base URL. */
		TRIGGER_API_URL: optionalNonEmpty,
		/** Optional; documented for tooling. Project ref is also set in `trigger.config.ts`. */
		TRIGGER_PROJECT_REF: optionalNonEmpty,
	},
	runtimeEnv: {
		CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
		HOST: process.env.HOST,
		TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
		TRIGGER_API_URL: process.env.TRIGGER_API_URL,
		TRIGGER_PROJECT_REF: process.env.TRIGGER_PROJECT_REF,
	},
});
