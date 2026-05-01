"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useConsultationChatScreen = () => {
	const router = useRouter();

	const handleBack = () => {
		router.back();
	};

	const handlePlaceholderAction = (label: string) => {
		toast.info(`${label} is coming soon.`);
	};

	return {
		handleBack,
		handlePlaceholderAction,
	};
};
