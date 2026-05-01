"use client";

import { Button } from "@repo/ui/components/ui/button";
import { ArrowLeftIcon, BotIcon, GlobeIcon } from "lucide-react";
import { useConsultationChatHeader } from "./hook";

interface ConsultationChatHeaderProps {
	onBack: () => void;
}

export const ConsultationChatHeader = (props: ConsultationChatHeaderProps) => {
	const { onBack } = props;
	useConsultationChatHeader();

	return (
		<div className="flex h-14 w-full min-w-0 shrink-0 items-center gap-3">
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="text-font-primary"
				onClick={onBack}
				aria-label="Go back"
			>
				<ArrowLeftIcon className="size-6" />
			</Button>
			<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0F6E6E] text-white">
				<BotIcon className="size-[18px]" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-[15px] font-semibold text-font-primary">AI Medical Assistant</p>
				<p className="text-[11px] text-font-secondary">Online</p>
			</div>
			<div className="flex shrink-0 items-center gap-1 rounded-xl bg-muted px-2.5 py-1">
				<GlobeIcon className="size-3 text-muted-foreground" />
				<span className="text-[11px] font-semibold text-muted-foreground">EN</span>
			</div>
		</div>
	);
};
