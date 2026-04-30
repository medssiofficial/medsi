"use client";

export const useFilesUpload = () => {
	const ACCEPTED_TYPES = [
		"application/pdf",
		"image/png",
		"image/jpeg",
		"image/webp",
		"text/plain",
	] as const;

	return {
		acceptedTypes: ACCEPTED_TYPES.join(","),
	};
};
