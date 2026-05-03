"use client";

import { BotIcon } from "lucide-react";
import { useConsultationChatMessages } from "./hook";

export const ConsultationChatMessages = () => {
	const { message } = useConsultationChatMessages();

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4">
			<div className="flex w-full max-w-full gap-2">
				<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0F6E6E] text-white">
					<BotIcon className="size-3.5" />
				</div>
				<div className="max-w-[260px] rounded-br-xl rounded-tr-xl rounded-bl-xl border border-border-subtle bg-card p-3 shadow-sm">
					<p className="whitespace-pre-wrap text-sm leading-relaxed text-font-primary">{message}</p>
				</div>
			</div>
		</div>
	);
};
