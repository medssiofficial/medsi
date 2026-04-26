"use client";

import { useMemo } from "react";

const MAX_PAGE_BUTTONS = 5;

export const useApplicationsTable = (args: {
	currentPage: number;
	totalPages: number;
}) => {
	const { currentPage, totalPages } = args;

	const pageNumbers = useMemo(() => {
		if (totalPages <= MAX_PAGE_BUTTONS) {
			return Array.from({ length: totalPages }, (_, index) => index + 1);
		}

		const start = Math.max(1, currentPage - 2);
		const end = Math.min(totalPages, start + MAX_PAGE_BUTTONS - 1);
		const adjustedStart = Math.max(1, end - MAX_PAGE_BUTTONS + 1);

		return Array.from(
			{ length: end - adjustedStart + 1 },
			(_, index) => adjustedStart + index,
		);
	}, [currentPage, totalPages]);

	const getStatusTone = (status: string) => {
		if (status === "approved") return "default";
		if (status === "rejected") return "destructive";
		if (status === "under_review") return "secondary";
		return "outline";
	};

	const getStatusLabel = (status: string) =>
		status
			.split("_")
			.map((token) => `${token[0]?.toUpperCase() ?? ""}${token.slice(1)}`)
			.join(" ");

	const formatDate = (value: Date | string) => {
		const date = value instanceof Date ? value : new Date(value);
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date);
	};

	return {
		pageNumbers,
		getStatusTone,
		getStatusLabel,
		formatDate,
	};
};
