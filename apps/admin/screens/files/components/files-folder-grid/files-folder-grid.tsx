"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@repo/ui/components/ui/context-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@repo/ui/components/ui/empty";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { FolderIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useFilesFolderGrid } from "./hook";

type FolderItem = {
	id: string;
	name: string;
	email: string;
	file_count: number;
	last_file_at: string | Date | null;
	href: string;
};

interface FilesFolderGridProps {
	items: FolderItem[];
	isLoading: boolean;
	page: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onPageChange: (nextPage: number) => void;
	onSyncProcessing: () => void;
}

export const FilesFolderGrid = (props: FilesFolderGridProps) => {
	const {
		items,
		isLoading,
		page,
		totalPages,
		hasNextPage,
		hasPreviousPage,
		onPageChange,
		onSyncProcessing,
	} = props;
	const { formatDate, handleContextAction } = useFilesFolderGrid();

	if (isLoading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<div key={index} className="rounded-xl border bg-background p-4">
						<Skeleton className="h-5 w-32" />
						<Skeleton className="mt-2 h-3 w-48" />
						<Skeleton className="mt-4 h-3 w-28" />
					</div>
				))}
			</div>
		);
	}

	if (!items.length) {
		return (
			<Empty className="border">
				<EmptyHeader>
					<EmptyTitle>No records found.</EmptyTitle>
					<EmptyDescription>No folders available for this section.</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<div className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{items.map((item) => (
					<ContextMenu key={item.id}>
						<ContextMenuTrigger>
							<Link
								href={item.href}
								className="group block rounded-2xl border bg-linear-to-b from-background to-muted/20 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
							>
								<div className="flex items-start justify-between gap-2">
									<div className="flex items-start gap-2">
										<div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
											<FolderIcon className="size-4" />
										</div>
										<div className="min-w-0">
											<p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
												{item.name}
											</p>
											<p className="truncate text-xs text-muted-foreground">{item.email}</p>
										</div>
									</div>
									<Badge className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
										{item.file_count} files
									</Badge>
								</div>
								<div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
									<p>Last updated: {formatDate(item.last_file_at)}</p>
									<SparklesIcon className="size-3.5 text-primary/70" />
								</div>
							</Link>
						</ContextMenuTrigger>
						<ContextMenuContent className="w-48">
							<ContextMenuItem onSelect={() => handleContextAction("Open folder")}>
								Open folder
							</ContextMenuItem>
							<ContextMenuItem onSelect={onSyncProcessing}>
								Sync processing
							</ContextMenuItem>
							<ContextMenuItem onSelect={() => handleContextAction("Copy folder ID")}>
								Copy folder ID
							</ContextMenuItem>
						</ContextMenuContent>
					</ContextMenu>
				))}
			</div>

			<div className="flex items-center justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={!hasPreviousPage}
					onClick={() => onPageChange(Math.max(1, page - 1))}
				>
					Previous
				</Button>
				<span className="text-xs text-muted-foreground">
					Page {page} of {Math.max(totalPages, 1)}
				</span>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={!hasNextPage}
					onClick={() => onPageChange(page + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	);
};
