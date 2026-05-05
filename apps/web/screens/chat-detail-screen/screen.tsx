"use client";

import { ArrowLeftIcon, BotIcon, UserIcon } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useChatDetailScreen } from "./hook";

const statusTone = (status: string) => {
	if (status === "completed")
		return "border border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200";
	if (status === "cancelled")
		return "border border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200";
	return "border border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-200";
};

const statusLabel = (status: string) => {
	if (status === "completed") return "Completed";
	if (status === "cancelled") return "Cancelled";
	return "Ongoing";
};

const ChatDetailScreen = () => {
	const {
		caseId,
		messages,
		conversationStatus,
		isReadOnly,
		isLoading,
		messagesEndRef,
		handleContinueChat,
		handleGoBack,
	} = useChatDetailScreen();

	if (isLoading) {
		return (
			<div className="min-h-dvh bg-neutral-warm">
				<div className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col px-4 py-6 md:px-6">
					<Skeleton className="h-6 w-40" />
					<div className="mt-6 flex-1 space-y-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className={`flex gap-2 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
								<Skeleton className="size-7 rounded-full" />
								<Skeleton className="h-12 w-48 rounded-2xl" />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-dvh bg-neutral-warm">
			<div className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col">
			{/* Header */}
			<div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-5 py-4">
				<div className="flex items-center gap-3">
					<button type="button" onClick={handleGoBack} className="p-1">
						<ArrowLeftIcon className="size-5 text-font-primary" />
					</button>
					<h2 className="text-base font-semibold text-font-primary">
						Chat #{caseId.slice(0, 8).toUpperCase()}
					</h2>
				</div>
				<Badge className={`rounded-full px-2.5 py-1 text-xs ${statusTone(conversationStatus)}`}>
					{statusLabel(conversationStatus)}
				</Badge>
			</div>

			{/* Messages */}
			<div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 md:px-6">
				{messages.length === 0 ? (
					<div className="flex flex-1 items-center justify-center">
						<p className="text-sm text-font-secondary">No messages yet.</p>
					</div>
				) : (
					messages.map((msg) => (
						<div
							key={msg.id}
							className={`flex w-full max-w-full gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
						>
							<div
								className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
									msg.role === "assistant"
										? "bg-primary text-primary-foreground"
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
										: "rounded-tr-sm bg-primary text-primary-foreground"
								}`}
							>
								<p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Footer */}
			{!isReadOnly && (
				<div className="sticky bottom-0 border-t bg-background px-4 py-4 md:px-6">
					<Button
						type="button"
						onClick={handleContinueChat}
						className="h-12 w-full rounded-xl text-base"
					>
						Continue Chat
					</Button>
				</div>
			)}
			</div>
		</div>
	);
};

export default ChatDetailScreen;
