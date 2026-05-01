"use client";

import { InfoIcon } from "lucide-react";
import { useConsultationChatDisclaimer } from "./hook";

export const ConsultationChatDisclaimer = () => {
	useConsultationChatDisclaimer();

	return (
		<div className="mt-3 flex shrink-0 items-start gap-2 rounded-lg border-l-4 border-[#2563EB] bg-[#DBEAFE] px-3 py-2.5">
			<InfoIcon className="mt-0.5 size-4 shrink-0 text-[#2563EB]" aria-hidden />
			<p className="text-xs leading-relaxed text-[#0B1119]">
				AI-generated content. Always verify with your healthcare provider.
			</p>
		</div>
	);
};
