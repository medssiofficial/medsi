import { prisma } from "./client";

/**
 * Ensures pgvector extension and the doctor embedding storage table exist.
 * Safe to call on every Next.js server boot (uses IF NOT EXISTS).
 */
export const ensureDoctorEmbeddingVectorTable = async (): Promise<void> => {
	await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);

	const rows = await prisma.$queryRaw<[{ exists: boolean }]>`
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.tables
			WHERE table_schema = 'public'
				AND table_name = 'doctor_profile_embeddings'
		) AS exists;
	`;

	if (rows[0]?.exists) {
		return;
	}

	await prisma.$executeRawUnsafe(`
		CREATE TABLE doctor_profile_embeddings (
			doctor_id TEXT PRIMARY KEY,
			embedding vector(768) NOT NULL,
			model TEXT NOT NULL,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	await prisma.$executeRawUnsafe(`
		CREATE INDEX IF NOT EXISTS doctor_profile_embeddings_updated_at_idx
		ON doctor_profile_embeddings (updated_at DESC);
	`);
};
