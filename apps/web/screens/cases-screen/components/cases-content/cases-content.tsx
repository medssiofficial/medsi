"use client";

import type { PatientCasesPage } from "@/services/api/patient/get-cases";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { SearchIcon, StethoscopeIcon } from "lucide-react";
import { useCasesContent } from "./hook";

type CaseItem = PatientCasesPage["items"][number];

interface CasesContentProps {
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	items: CaseItem[];
	isLoading: boolean;
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
	onLoadMore: () => void;
	onStartConsultation: () => void;
	setSentinelRef: (node: HTMLDivElement | null) => void;
}

export const CasesContent = (props: CasesContentProps) => {
	const {
		searchInput,
		onSearchInputChange,
		items,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		onLoadMore,
		onStartConsultation,
		setSentinelRef,
	} = props;
	const { formatDate, toStatusLabel, toStatusTone, toStageTone, toStageLabel, handleCaseClick } = useCasesContent();

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<div className="relative flex-1">
					<SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-font-secondary" />
					<Input
						value={searchInput}
						onChange={(event) => onSearchInputChange(event.target.value)}
						placeholder="Search cases..."
						className="h-10 pl-9"
					/>
				</div>
				<Button
					type="button"
					onClick={onStartConsultation}
					className="h-10 rounded-xl px-4"
				>
					<StethoscopeIcon className="mr-1 size-4" />
					Create New
				</Button>
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
						No cases match your current search.
					</p>
				</div>
			) : (
				<>
					<div className="space-y-3">
						{items.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => handleCaseClick(item.id, item.case_stage)}
								className="w-full space-y-3 rounded-2xl border bg-background p-4 text-left transition-colors hover:bg-muted/50"
							>
								<div className="flex items-center justify-between gap-2">
									<p className="text-sm font-semibold text-font-primary">
										#{item.id.slice(0, 10).toUpperCase()}
									</p>
									<div className="flex items-center gap-1.5">
										<Badge className={`rounded-full px-2 py-0.5 text-xs ${toStageTone(item.case_stage)}`}>
											{toStageLabel(item.case_stage)}
										</Badge>
										<Badge className={`rounded-full px-2 py-0.5 text-xs ${toStatusTone(item.conversation_status)}`}>
											{toStatusLabel(item.conversation_status)}
										</Badge>
									</div>
								</div>
								<p className="line-clamp-2 text-sm text-font-secondary">
									{item.summary?.trim() || "No summary available yet."}
								</p>
								<div className="flex items-center justify-between text-xs text-font-secondary">
									<span>{formatDate(item.created_at)}</span>
									<span>{item.file_count} files</span>
								</div>
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
