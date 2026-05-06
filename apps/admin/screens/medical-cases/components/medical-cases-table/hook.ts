"use client";

import { useMemo } from "react";

const MAX_PAGE_BUTTONS = 5;

export const useMedicalCasesTable = (args: {
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

	const truncateId = (id: string) => {
		if (id.length <= 8) return id;
		return `${id.slice(0, 8)}...`;
	};

	const getStageBadgeClasses = (stage: string) => {
		switch (stage) {
			case "chatting":
				return "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100";
			case "processing":
				return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100";
			case "analyzed":
				return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100";
			case "ready_for_matching":
				return "bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-100";
			default:
				return "bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100";
		}
	};

	const getStatusBadgeClasses = (status: string) => {
		switch (status) {
			case "in_progress":
				return "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100";
			case "completed":
				return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100";
			case "cancelled":
				return "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100";
			default:
				return "bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100";
		}
	};

	const formatStageLabel = (stage: string) => {
		return stage.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	};

	const formatStatusLabel = (status: string) => {
		return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	};

	return {
		pageNumbers,
		formatDate,
		truncateId,
		getStageBadgeClasses,
		getStatusBadgeClasses,
		formatStageLabel,
		formatStatusLabel,
	};
};
