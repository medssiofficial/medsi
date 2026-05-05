import { prisma } from "./client";

export const ensureCaseEmbeddingVectorTable = async (): Promise<void> => {
	await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);

	const rows = await prisma.$queryRaw<[{ exists: boolean }]>`
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.tables
			WHERE table_schema = 'public'
				AND table_name = 'case_analysis_embeddings'
		) AS exists;
	`;

	if (rows[0]?.exists) {
		return;
	}

	await prisma.$executeRawUnsafe(`
		CREATE TABLE case_analysis_embeddings (
			case_id TEXT PRIMARY KEY,
			embedding vector(768) NOT NULL,
			model TEXT NOT NULL,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	await prisma.$executeRawUnsafe(`
		CREATE INDEX IF NOT EXISTS case_analysis_embeddings_updated_at_idx
		ON case_analysis_embeddings (updated_at DESC);
	`);
};
