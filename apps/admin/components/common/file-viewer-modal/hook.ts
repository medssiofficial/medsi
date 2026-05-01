"use client";

const getFileKind = (mimeType: string) => {
	const normalized = mimeType.toLowerCase();
	if (normalized.startsWith("video/")) return "video";
	if (normalized.startsWith("image/")) return "image";
	if (normalized === "application/pdf") return "pdf";
	if (normalized.startsWith("text/")) return "text";
	return "other";
};

const getFileExtension = (filename: string) => {
	const idx = filename.lastIndexOf(".");
	return idx < 0 ? "" : filename.slice(idx + 1).toLowerCase();
};

export const useFileViewerModal = () => ({
	getFileKind,
	getFileExtension,
});
