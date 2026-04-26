import {
	getDefaultStorageBucket,
	getSupabaseServiceClient,
} from "../client/supabase-client";
import type { SupabaseStorageResult, UploadedFileMetadata } from "./types";

interface DeleteFileByPathArgs {
	path: string;
	bucket?: string;
}

interface DeleteFileByMetadataArgs {
	file: Pick<UploadedFileMetadata, "path" | "bucket">;
}

type DeleteFileArgs = DeleteFileByPathArgs | DeleteFileByMetadataArgs;

const resolveDeleteTarget = (
	args: DeleteFileArgs,
): { bucket: string | null; path: string | null } => {
	if ("file" in args) {
		return {
			bucket: args.file.bucket?.trim() || null,
			path: args.file.path?.trim() || null,
		};
	}

	return {
		bucket: args.bucket?.trim() || getDefaultStorageBucket(),
		path: args.path?.trim() || null,
	};
};

export const deleteFile = async (
	args: DeleteFileArgs,
): Promise<SupabaseStorageResult<{ bucket: string; path: string }>> => {
	const target = resolveDeleteTarget(args);
	if (!target.bucket) {
		return {
			success: false,
			error: "Missing storage bucket. Set SUPABASE_STORAGE_BUCKET or pass bucket.",
		};
	}
	if (!target.path) {
		return {
			success: false,
			error: "File path is required for delete operation.",
		};
	}

	const supabase = getSupabaseServiceClient();
	if (!supabase) {
		return {
			success: false,
			error:
				"Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.",
		};
	}

	const response = await supabase.storage.from(target.bucket).remove([target.path]);
	if (response.error) {
		return {
			success: false,
			error: response.error.message,
		};
	}

	return {
		success: true,
		data: {
			bucket: target.bucket,
			path: target.path,
		},
	};
};
