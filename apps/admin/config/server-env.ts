import { CLI_ENV } from "@repo/env";
import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const SERVER_ENV = createEnv({
	server: {
		CLERK_SECRET_KEY: z.string(),
	},
	runtimeEnv: {
		CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
	},
});
