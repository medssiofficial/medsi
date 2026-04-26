import {
	getDefaultStorageBucket,
	getSupabaseServiceClient,
} from "../client/supabase-client";
import type { SupabaseStorageResult, UploadedFileMetadata } from "./types";

type UploadBody = ArrayBuffer | Blob | File | Buffer | Uint8Array;

interface UploadPublicFileArgs {
	file: UploadBody;
	fileName: string;
	bucket?: string;
	folder?: string;
	contentType?: string;
	cacheControl?: string;
	upsert?: boolean;
}

const sanitizePathSegment = (value: string) =>
	value
		.trim()
		.replace(/[^a-zA-Z0-9._-]/g, "-")
		.replace(/-+/g, "-");

const resolveSize = (file: UploadBody): number | null => {
	if (typeof Buffer !== "undefined" && Buffer.isBuffer(file)) return file.byteLength;
	if ("byteLength" in file && typeof file.byteLength === "number") return file.byteLength;
	if ("size" in file && typeof file.size === "number") return file.size;
	return null;
};

export const uploadPublicFile = async (
	args: UploadPublicFileArgs,
): Promise<SupabaseStorageResult<UploadedFileMetadata>> => {
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

	const fileName = sanitizePathSegment(args.fileName);
	if (!fileName) {
		return {
			success: false,
			error: "File name is required.",
		};
	}

	const folder = args.folder?.trim() ? sanitizePathSegment(args.folder) : "uploads";
	const path = `${folder}/${Date.now()}-${fileName}`;

	const uploadResponse = await supabase.storage.from(bucket).upload(path, args.file, {
		upsert: args.upsert ?? false,
		contentType: args.contentType,
		cacheControl: args.cacheControl,
	});

	if (uploadResponse.error) {
		return {
			success: false,
			error: uploadResponse.error.message,
		};
	}

	const publicResponse = supabase.storage.from(bucket).getPublicUrl(path);

	return {
		success: true,
		data: {
			bucket,
			path,
			fullPath: uploadResponse.data.fullPath,
			publicUrl: publicResponse.data.publicUrl,
			contentType: args.contentType ?? null,
			size: resolveSize(args.file),
			uploadedAt: new Date().toISOString(),
		},
	};
};
