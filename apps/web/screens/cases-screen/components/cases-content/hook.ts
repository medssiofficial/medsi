"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

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

const toStageTone = (stage: string) => {
	if (stage === "analyzed" || stage === "ready_for_matching") return "bg-green-100 text-green-700";
	if (stage === "processing") return "bg-amber-100 text-amber-700";
	return "bg-blue-100 text-blue-700";
};

const toStageLabel = (stage: string) => {
	if (stage === "chatting") return "Chatting";
	if (stage === "processing") return "Processing";
	if (stage === "analyzed") return "Analyzed";
	if (stage === "ready_for_matching") return "Ready";
	return stage;
};

const getCaseRoute = (caseId: string, stage: string) => {
	if (stage === "chatting") return `/consultation/chat?caseId=${caseId}`;
	if (stage === "processing") return `/cases/${caseId}/analyzing`;
	if (stage === "analyzed") return `/cases/${caseId}/analyzed`;
	if (stage === "ready_for_matching") return `/cases/${caseId}/review`;
	return `/cases/${caseId}/analyzed`;
};

export const useCasesContent = () => {
	const router = useRouter();

	const handleCaseClick = useCallback(
		(caseId: string, stage: string) => {
			router.push(getCaseRoute(caseId, stage));
		},
		[router],
	);

	return {
		formatDate,
		toStatusTone,
		toStatusLabel,
		toStageTone,
		toStageLabel,
		handleCaseClick,
	};
};
