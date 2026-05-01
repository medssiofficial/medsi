"use client";

import { useConsultationChatProgress } from "./hook";

export const ConsultationChatProgress = () => {
	useConsultationChatProgress();

	return (
		<div className="h-[3px] w-full shrink-0 bg-[#E8ECF0]">
			<div className="h-full w-[40%] max-w-[150px] bg-[#0F6E6E]" />
		</div>
	);
};
