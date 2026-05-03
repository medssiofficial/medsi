"use client";

import { InfoIcon } from "lucide-react";
import { useConsultationChatDisclaimer } from "./hook";

export const ConsultationChatDisclaimer = () => {
	useConsultationChatDisclaimer();

	return (
		<div className="mt-3 flex shrink-0 items-start gap-2 rounded-lg border-l-4 border-info bg-info-surface px-3 py-2.5">
			<InfoIcon className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
			<p className="text-xs leading-relaxed text-info-foreground">
				AI-generated content. Always verify with your healthcare provider.
			</p>
		</div>
	);
};
