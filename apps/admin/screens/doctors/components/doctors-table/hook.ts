"use client";

import { useMemo } from "react";

const MAX_PAGE_BUTTONS = 5;

export const useDoctorsTable = (args: {
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

	const formatDate = (value: Date | string) => {
		const date = value instanceof Date ? value : new Date(value);
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date);
	};

	const toWorkSetup = (value: string | null | undefined) => {
		if (!value) return "-";
		return value
			.split("_")
			.map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
			.join(" ");
	};

	return {
		pageNumbers,
		formatDate,
		toWorkSetup,
	};
};
