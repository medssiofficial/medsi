"use client";

import { Button } from "@repo/ui/components/ui/button";
import { MicIcon, PaperclipIcon, SendIcon } from "lucide-react";
import { useConsultationChatInput } from "./hook";

interface ConsultationChatInputProps {
	onAttach: () => void;
	onMic: () => void;
	onSend: () => void;
}

export const ConsultationChatInput = (props: ConsultationChatInputProps) => {
	const { onAttach, onMic, onSend } = props;
	useConsultationChatInput();

	return (
		<div className="flex shrink-0 items-center gap-2 border-t border-border-subtle bg-neutral-warm pb-6 pt-3">
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="text-muted-foreground"
				onClick={onAttach}
				aria-label="Attach file"
			>
				<PaperclipIcon className="size-[22px]" />
			</Button>
			<button
				type="button"
				className="flex h-11 min-w-0 flex-1 items-center rounded-full bg-muted px-4 text-left text-sm text-muted-foreground"
				onClick={onSend}
			>
				Type a message...
			</button>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="text-muted-foreground"
				onClick={onMic}
				aria-label="Voice input"
			>
				<MicIcon className="size-[22px]" />
			</Button>
			<Button
				type="button"
				size="icon"
				className="size-10 shrink-0 rounded-full bg-[#0F6E6E] text-white hover:bg-[#0c5a5a]"
				onClick={onSend}
				aria-label="Send message"
			>
				<SendIcon className="size-[18px]" />
			</Button>
		</div>
	);
};
