export {
	getSupabaseServiceClient,
	getSupabaseAnonClient,
	getDefaultStorageBucket,
} from "./client/supabase-client";

export { uploadPublicFile } from "./storage/upload-public-file";
export { deleteFile } from "./storage/delete-file";

export {
	upsertDoctorProfileEmbedding,
	type UpsertDoctorProfileEmbeddingArgs,
	type UpsertDoctorProfileEmbeddingResult,
} from "./vector/upsert-doctor-profile-embedding";

export type {
	SupabaseStorageResult,
	UploadedFileMetadata,
} from "./storage/types";
