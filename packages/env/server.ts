import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const SERVER_ENV = createEnv({
	server: {
		DATABASE_URL: z.url(),
		DIRECT_DATABASE_URL: z.url(),
		ENV: z.enum(["development", "production", "staging"]),
	},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,
		ENV: process.env.ENV,
	},
});
