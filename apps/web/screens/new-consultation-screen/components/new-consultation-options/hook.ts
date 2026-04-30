"use client";

import {
	ClipboardListIcon,
	FileTextIcon,
	MessageCircleIcon,
	MicIcon,
	UploadIcon,
	type LucideIcon,
} from "lucide-react";

export const useNewConsultationOptions = () => {
	const iconMap = {
		"file-text": FileTextIcon,
		mic: MicIcon,
		upload: UploadIcon,
		"clipboard-list": ClipboardListIcon,
		"message-circle": MessageCircleIcon,
	} as const;

	const getIcon = (key: keyof typeof iconMap): LucideIcon => {
		return iconMap[key];
	};

	return {
		getIcon,
	};
};
