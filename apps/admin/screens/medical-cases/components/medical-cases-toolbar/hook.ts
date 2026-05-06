"use client";

export const useMedicalCasesToolbar = () => {
	const stageOptions = [
		{ label: "All Stages", value: "all" },
		{ label: "Chatting", value: "chatting" },
		{ label: "Processing", value: "processing" },
		{ label: "Analyzed", value: "analyzed" },
		{ label: "Ready for Matching", value: "ready_for_matching" },
	];

	const statusOptions = [
		{ label: "All Statuses", value: "all" },
		{ label: "In Progress", value: "in_progress" },
		{ label: "Completed", value: "completed" },
		{ label: "Cancelled", value: "cancelled" },
	];

	return {
		stageOptions,
		statusOptions,
	};
};
