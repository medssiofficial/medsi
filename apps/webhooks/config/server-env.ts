import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const SERVER_ENV = createEnv({
	server: {
		ADMIN_CLERK_SIGNING_SECRET: z.string().optional(),
		DOCTOR_CLERK_SIGNING_SECRET: z.string(),
		CUSTOMER_CLERK_SIGNING_SECRET: z.string().optional(),
		SENTRY_DSN: z.string().optional(),
	},
	runtimeEnv: {
		ADMIN_CLERK_SIGNING_SECRET: process.env.ADMIN_CLERK_SIGNING_SECRET,
		DOCTOR_CLERK_SIGNING_SECRET: process.env.DOCTOR_CLERK_SIGNING_SECRET,
		CUSTOMER_CLERK_SIGNING_SECRET: process.env.CUSTOMER_CLERK_SIGNING_SECRET,
		SENTRY_DSN: process.env.SENTRY_DSN,
	},
});
