"use client";

const formatDate = (value: Date | string) => {
	const date = value instanceof Date ? value : new Date(value);
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
};

const toStatusTone = (status: string) => {
	if (status === "completed") return "bg-emerald-100 text-emerald-800";
	if (status === "cancelled") return "bg-rose-100 text-rose-800";
	return "bg-blue-100 text-blue-800";
};

const toStatusLabel = (status: string) => {
	if (status === "completed") return "Completed";
	if (status === "cancelled") return "Cancelled";
	return "In progress";
};

export const useChatContent = () => {
	return {
		formatDate,
		toStatusTone,
		toStatusLabel,
	};
};
