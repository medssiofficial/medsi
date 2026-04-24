import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const SERVER_ENV = createEnv({
	server: {
		DOCTOR_CLERK_SIGNING_SECRET: z.string(),
	},
	runtimeEnv: {
		DOCTOR_CLERK_SIGNING_SECRET: process.env.DOCTOR_CLERK_SIGNING_SECRET,
	},
});
