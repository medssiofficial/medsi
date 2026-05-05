import {
	getDefaultStorageBucket,
	getSupabaseServiceClient,
} from "../client/supabase-client";
import type { SupabaseStorageResult } from "./types";

interface DownloadStorageObjectArgs {
	path: string;
	bucket?: string;
}

export const downloadStorageObject = async (
	args: DownloadStorageObjectArgs,
): Promise<SupabaseStorageResult<Uint8Array>> => {
	const bucket = args.bucket?.trim() || getDefaultStorageBucket();
	if (!bucket) {
		return {
			success: false,
			error: "Missing storage bucket. Set SUPABASE_STORAGE_BUCKET or pass bucket.",
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

	const path = args.path.trim();
	if (!path) {
		return { success: false, error: "Storage path is required." };
	}

	const response = await supabase.storage.from(bucket).download(path);

	if (response.error) {
		return {
			success: false,
			error: response.error.message,
		};
	}

	const arrayBuffer = await response.data.arrayBuffer();
	return {
		success: true,
		data: new Uint8Array(arrayBuffer),
	};
};
