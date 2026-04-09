import { CLI_ENV } from "@repo/env/cli";
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: CLI_ENV.DIRECT_DATABASE_URL,
	},
});
