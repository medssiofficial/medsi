import { PrismaClient } from "./types/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { CLI_ENV } from "@repo/env";

const globalForPrisma = global as unknown as {
	prisma: PrismaClient;
};

const adapter = new PrismaPg({
	connectionString: CLI_ENV.DATABASE_URL,
});
const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		adapter,
	});

if (CLI_ENV.ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
