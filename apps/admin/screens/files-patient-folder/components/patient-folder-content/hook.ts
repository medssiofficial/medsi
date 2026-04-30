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

export const usePatientFolderContent = () => {
	return {
		formatDate,
		handleContextAction: (label: string) => toast.info(`${label} is coming soon.`),
	};
};
