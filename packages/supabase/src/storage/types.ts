export interface UploadedFileMetadata {
	bucket: string;
	path: string;
	fullPath: string;
	publicUrl: string;
	contentType: string | null;
	size: number | null;
	uploadedAt: string;
}

export type SupabaseStorageResult<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: string;
	  };
