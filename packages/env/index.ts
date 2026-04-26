import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";
import z from "zod";

if (existsSync(path.resolve(cwd(), "../../.env"))) {
	console.log("Loading .env file");
	config({
		path: path.resolve(cwd(), "../../.env"),
	});
}

export const CLI_ENV = createEnv({
	server: {
		DATABASE_URL: z.url(),
		DIRECT_DATABASE_URL: z.url(),
		ENV: z.enum(["development", "production"]),
	},
	runtimeEnvStrict: {
		DATABASE_URL: process.env.DATABASE_URL,
		DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,
		ENV: process.env.ENV,
	},
});

export const EMAIL_ENV = createEnv({
	server: {
		RESEND_API_KEY: z.string().optional(),
		EMAIL_FROM: z.string().optional(),
		EMAIL_REPLY_TO: z.string().optional(),
		APP_BASE_URL: z.string().optional(),
	},
	runtimeEnvStrict: {
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		EMAIL_FROM: process.env.EMAIL_FROM,
		EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO,
		APP_BASE_URL: process.env.APP_BASE_URL,
	},
});

export const SUPABASE_ENV = createEnv({
	server: {
		NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
		NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
		SUPABASE_SECRET_KEY: z.string().optional(),
		SUPABASE_STORAGE_BUCKET: z.string().optional(),
	},
	runtimeEnvStrict: {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
			process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
		SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
		SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
	},
});
