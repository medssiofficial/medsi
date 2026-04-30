"use client";

import { toast } from "sonner";

const formatDate = (value: Date | string) => {
	const date = value instanceof Date ? value : new Date(value);
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
};

const formatFileSize = (bytes: number | null) => {
	if (!bytes || bytes <= 0) return "Unknown size";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const useDoctorFolderContent = () => {
	return {
		formatDate,
		formatFileSize,
		handleContextAction: (label: string) => toast.info(`${label} is coming soon.`),
	};
};
