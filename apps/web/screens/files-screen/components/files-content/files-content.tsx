"use client";

import { FILES_URL } from "@/config/client-constants";
import type { PatientFilesPage } from "@/services/api/patient/get-files";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import Link from "next/link";
import { SearchIcon, SparklesIcon } from "lucide-react";
import { useFilesContent } from "./hook";

type FileItem = PatientFilesPage["items"][number];

interface FilesContentProps {
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	items: FileItem[];
	isLoading: boolean;
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
	onLoadMore: () => void;
	setSentinelRef: (node: HTMLDivElement | null) => void;
	onProcessFile: (fileId: string, reportType: string) => void;
	onBulkProcess: () => void;
	isBulkProcessing: boolean;
	isProcessingFile: string | null;
	eligibleBulkCount: number;
}

export const FilesContent = (props: FilesContentProps) => {
	const {
		searchInput,
		onSearchInputChange,
		items,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		onLoadMore,
		setSentinelRef,
		onProcessFile,
		onBulkProcess,
		isBulkProcessing,
		isProcessingFile,
		eligibleBulkCount,
	} = props;
	const { formatDate, toProcessingTone } = useFilesContent();

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={isBulkProcessing || eligibleBulkCount === 0}
					onClick={onBulkProcess}
				>
					<SparklesIcon className="mr-1.5 size-4" />
					{isBulkProcessing ? "Queueing…" : `Process all eligible (${eligibleBulkCount})`}
				</Button>
			</div>
			<div className="relative">
				<SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-font-secondary" />
				<Input
					value={searchInput}
					onChange={(event) => onSearchInputChange(event.target.value)}
					placeholder="Search files..."
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
						No files match your current search.
					</p>
				</div>
			) : (
				<>
					<div className="space-y-3">
						{items.map((item) => (
							<div key={item.id} className="space-y-3 rounded-2xl border bg-background p-4">
								<div className="flex items-center justify-between gap-3">
									<p className="truncate text-sm font-semibold text-font-primary">
										{item.filename}
									</p>
									<Badge className={`rounded-full px-2.5 py-1 text-xs ${toProcessingTone(item.processing_status)}`}>
										{item.processing_status}
									</Badge>
								</div>
								<div className="flex items-center justify-between text-xs text-font-secondary">
									<span>{item.report_type.replace("_", " ")}</span>
									<span>{formatDate(item.created_at)}</span>
								</div>
								<p className="text-xs text-font-secondary">
									Used in {item.used_in_cases_count} case(s)
									{item.related_case_ids.length > 0
										? ` • ${item.related_case_ids
												.slice(0, 2)
												.map((id) => `#${id.slice(0, 8).toUpperCase()}`)
												.join(", ")}`
										: ""}
								</p>
								<div className="flex flex-wrap gap-2">
									<Button asChild type="button" size="sm" variant="secondary">
										<Link href={`${FILES_URL}/${item.id}`}>Summary & text</Link>
									</Button>
									<Button
										type="button"
										size="sm"
										variant="outline"
										disabled={
											Boolean(isProcessingFile && isProcessingFile === item.id) ||
											(item.report_type === "text_report" &&
												item.processing_status !== "pending" &&
												item.processing_status !== "failed")
										}
										onClick={() => onProcessFile(item.id, item.report_type)}
									>
										Process with AI
									</Button>
									{item.public_url ? (
										<Button asChild type="button" size="sm" variant="outline">
											<Link href={item.public_url} target="_blank" rel="noreferrer">
												View document
											</Link>
										</Button>
									) : (
										<Button type="button" size="sm" variant="outline" disabled>
											View unavailable
										</Button>
									)}
								</div>
							</div>
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
