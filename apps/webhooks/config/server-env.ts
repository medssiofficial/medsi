import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const SERVER_ENV = createEnv({
	server: {
		ADMIN_CLERK_SIGNING_SECRET: z.string().optional(),
		DOCTOR_CLERK_SIGNING_SECRET: z.string(),
	},
	runtimeEnv: {
		ADMIN_CLERK_SIGNING_SECRET: process.env.ADMIN_CLERK_SIGNING_SECRET,
		DOCTOR_CLERK_SIGNING_SECRET: process.env.DOCTOR_CLERK_SIGNING_SECRET,
	},
});
