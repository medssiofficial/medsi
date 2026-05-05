"use client";

import type { PatientChatsPage } from "@/services/api/patient/get-chats";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { MessageCircleIcon, SearchIcon } from "lucide-react";
import { useChatContent } from "./hook";

type ChatItem = PatientChatsPage["items"][number];

interface ChatContentProps {
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	items: ChatItem[];
	isLoading: boolean;
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
	onLoadMore: () => void;
	setSentinelRef: (node: HTMLDivElement | null) => void;
}

export const ChatContent = (props: ChatContentProps) => {
	const {
		searchInput,
		onSearchInputChange,
		items,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		onLoadMore,
		setSentinelRef,
	} = props;
	const { formatDate, toStatusLabel, toStatusTone, handleChatClick } = useChatContent();

	return (
		<div className="space-y-4">
			<div className="relative">
				<SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-font-secondary" />
				<Input
					value={searchInput}
					onChange={(event) => onSearchInputChange(event.target.value)}
					placeholder="Search chats..."
					className="h-10 pl-9"
				/>
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} className="rounded-2xl border bg-background p-4">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="mt-3 h-3 w-full" />
							<Skeleton className="mt-2 h-3 w-3/4" />
						</div>
					))}
				</div>
			) : items.length === 0 ? (
				<div className="rounded-2xl border border-dashed bg-background p-8 text-center">
					<p className="text-sm font-medium text-font-primary">No records found.</p>
					<p className="mt-1 text-xs text-font-secondary">
						No chats match your current search.
					</p>
				</div>
			) : (
				<>
					<div className="space-y-3">
						{items.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => handleChatClick(item.id)}
								className="w-full space-y-3 rounded-2xl border bg-background p-4 text-left transition-colors hover:bg-muted/50"
							>
								<div className="flex items-center justify-between gap-2">
									<p className="text-sm font-semibold text-font-primary">
										Chat #{item.id.slice(0, 8).toUpperCase()}
									</p>
									<Badge className={`rounded-full px-2.5 py-1 text-xs ${toStatusTone(item.status)}`}>
										{toStatusLabel(item.status)}
									</Badge>
								</div>
								<div className="flex items-start gap-2">
									<MessageCircleIcon className="mt-0.5 size-4 text-font-secondary" />
									<p className="line-clamp-2 text-sm text-font-secondary">{item.preview}</p>
								</div>
								<p className="text-xs text-font-secondary">Updated {formatDate(item.updated_at)}</p>
							</button>
						))}
					</div>

					<div ref={setSentinelRef} className="h-3 w-full" />

					<div className="flex flex-col items-center gap-2 py-2">
						{isFetchingNextPage ? (
							<p className="text-xs text-font-secondary">Loading more...</p>
						) : hasNextPage ? (
							<Button type="button" variant="outline" size="sm" onClick={onLoadMore}>
								Load more
							</Button>
						) : (
							<p className="text-xs text-font-secondary">No more to show.</p>
						)}
					</div>
				</>
			)}
		</div>
	);
};
