"use client";

import type { MedicalCaseDetail } from "@/services/api/admin/medical-cases/get-medical-case-detail";

export const useCaseDetailContent = (args: {
	medicalCase: MedicalCaseDetail;
}) => {
	const { medicalCase } = args;

	const formatDate = (value: Date | string) => {
		const date = value instanceof Date ? value : new Date(value);
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
		}).format(date);
	};

	const formatShortDate = (value: Date | string) => {
		const date = value instanceof Date ? value : new Date(value);
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		}).format(date);
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

	const getProcessingStatusClasses = (status: string) => {
		switch (status) {
			case "completed":
				return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100";
			case "processing":
				return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100";
			case "failed":
				return "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100";
			default:
				return "bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100";
		}
	};

	const formatLabel = (value: string) => {
		return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	};

	return {
		medicalCase,
		formatDate,
		formatShortDate,
		getStageBadgeClasses,
		getStatusBadgeClasses,
		getProcessingStatusClasses,
		formatLabel,
	};
};
