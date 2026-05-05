"use client";

import { BotIcon, UserIcon } from "lucide-react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import type { RefObject } from "react";
import { useConsultationChatMessages } from "./hook";

interface ChatMessage {
	id: string;
	role: "assistant" | "user";
	content: string;
	file_id?: string | null;
	isLoading?: boolean;
}

interface ConsultationChatMessagesProps {
	messages: ChatMessage[];
	messagesEndRef: RefObject<HTMLDivElement | null>;
}

export const ConsultationChatMessages = (
	props: ConsultationChatMessagesProps,
) => {
	const { messages, messagesEndRef } = props;
	useConsultationChatMessages();

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-4">
			{messages.map((msg) => (
				<div
					key={msg.id}
					className={`flex w-full max-w-full gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
				>
					<div
						className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
							msg.role === "assistant"
								? "bg-[#0F6E6E] text-white"
								: "bg-muted text-font-secondary"
						}`}
					>
						{msg.role === "assistant" ? (
							<BotIcon className="size-3.5" />
						) : (
							<UserIcon className="size-3.5" />
						)}
					</div>
					<div
						className={`max-w-[75%] rounded-2xl border border-border-subtle p-3 shadow-sm ${
							msg.role === "assistant"
								? "rounded-tl-sm bg-card"
								: "rounded-tr-sm bg-[#0F6E6E] text-white"
						}`}
					>
						{msg.isLoading ? (
							<div className="space-y-2">
								<Skeleton className="h-3 w-32" />
								<Skeleton className="h-3 w-24" />
							</div>
						) : (
							<p className="whitespace-pre-wrap text-sm leading-relaxed">
								{msg.content}
							</p>
						)}
					</div>
				</div>
			))}
			<div ref={messagesEndRef} />
		</div>
	);
};
