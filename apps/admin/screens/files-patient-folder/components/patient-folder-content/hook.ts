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

const toProcessingTone = (status: string) => {
	if (status === "completed") return "bg-emerald-100 text-emerald-800";
	if (status === "failed") return "bg-rose-100 text-rose-800";
	if (status === "processing") return "bg-blue-100 text-blue-800";
	if (status === "not_supported") return "bg-muted text-muted-foreground";
	return "bg-amber-100 text-amber-800";
};

export const usePatientFolderContent = () => {
	return {
		formatDate,
		formatFileSize,
		toProcessingTone,
		handleContextAction: (label: string) => toast.info(`${label} is coming soon.`),
	};
};
