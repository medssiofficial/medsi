"use client";

const formatDate = (value: Date | string) => {
	const date = value instanceof Date ? value : new Date(value);
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
};

const toProcessingTone = (status: string) => {
	if (status === "completed") return "bg-emerald-100 text-emerald-800";
	if (status === "failed") return "bg-rose-100 text-rose-800";
	if (status === "processing") return "bg-amber-100 text-amber-800";
	return "bg-slate-100 text-slate-700";
};

export const useFilesContent = () => {
	return {
		formatDate,
		toProcessingTone,
	};
};
