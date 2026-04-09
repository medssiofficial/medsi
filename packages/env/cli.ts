import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
import { cwd } from "node:process";
import z from "zod";

if (existsSync(path.resolve(cwd(), ".env"))) {
	config({
		path: path.resolve(cwd(), ".env"),
	});
}

export const CLI_ENV = createEnv({
	server: {
		DATABASE_URL: z.url(),
		DIRECT_DATABASE_URL: z.url(),
	},
	runtimeEnvStrict: {
		DATABASE_URL: process.env.DATABASE_URL,
		DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,
	},
});
