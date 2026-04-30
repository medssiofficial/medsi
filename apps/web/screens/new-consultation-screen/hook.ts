"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type NewConsultationOption = {
	key: "type" | "voice" | "upload" | "form" | "chat";
	title: string;
	description: string;
	icon: "file-text" | "mic" | "upload" | "clipboard-list" | "message-circle";
};

const OPTIONS: NewConsultationOption[] = [
	{
		key: "type",
		title: "Type it out",
		description: "Describe your symptoms in writing",
		icon: "file-text",
	},
	{
		key: "voice",
		title: "Voice Input",
		description: "Speak your symptoms aloud",
		icon: "mic",
	},
	{
		key: "upload",
		title: "Upload Documents",
		description: "Share reports or scans",
		icon: "upload",
	},
	{
		key: "form",
		title: "Medical Form",
		description: "Fill a structured health questionnaire",
		icon: "clipboard-list",
	},
	{
		key: "chat",
		title: "Chat",
		description: "Start with a guided AI chat",
		icon: "message-circle",
	},
];

export const useNewConsultationScreen = () => {
	const router = useRouter();

	const handleBack = () => {
		router.back();
	};

	const handleOptionClick = (option: NewConsultationOption) => {
		toast.info(`${option.title} is coming soon.`);
	};

	return {
		options: OPTIONS,
		handleBack,
		handleOptionClick,
	};
};
