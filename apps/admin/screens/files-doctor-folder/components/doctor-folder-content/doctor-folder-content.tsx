"use client";

import type { DoctorFolderDetail } from "@/services/api/admin/files/get-doctor-folder-detail";
import { FileViewerModal } from "@/components/common/file-viewer-modal";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@repo/ui/components/ui/breadcrumb";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@repo/ui/components/ui/context-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@repo/ui/components/ui/empty";
import { Input } from "@repo/ui/components/ui/input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { FileIcon, RefreshCwIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useDoctorFolderContent } from "./hook";

interface DoctorFolderContentProps {
	detail: DoctorFolderDetail | null;
	isLoading: boolean;
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	page: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onPageChange: (nextPage: number) => void;
	onSyncProcessing: () => void;
}

export const DoctorFolderContent = (props: DoctorFolderContentProps) => {
	const {
		detail,
		isLoading,
		searchInput,
		onSearchInputChange,
		page,
		totalPages,
		hasNextPage,
		hasPreviousPage,
		onPageChange,
		onSyncProcessing,
	} = props;
	const { formatDate, formatFileSize, handleContextAction } = useDoctorFolderContent();
	const [activeFile, setActiveFile] = useState<DoctorFolderDetail["files"][number] | null>(
		null,
	);

	const openPreview = (file: DoctorFolderDetail["files"][number]) => {
		if (file.mime_type.toLowerCase().startsWith("video/")) {
			toast.info("Video preview is not supported yet.");
			return;
		}
		setActiveFile(file);
	};

	if (isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 5 }).map((_, index) => (
					<div key={index} className="rounded-xl border bg-background p-4">
						<Skeleton className="h-4 w-44" />
						<Skeleton className="mt-2 h-3 w-64" />
					</div>
				))}
			</div>
		);
	}

	if (!detail) return null;

	return (
		<div className="space-y-4">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href="/files">Files</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href="/files">Doctors</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{detail.doctor.name}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background p-4">
				<div>
					<p className="text-sm font-semibold text-foreground">{detail.doctor.name}</p>
					<p className="text-xs text-muted-foreground">{detail.doctor.email}</p>
				</div>
				<Button type="button" variant="outline" onClick={onSyncProcessing}>
					<RefreshCwIcon className="mr-1.5 size-4" />
					Sync Processing
				</Button>
			</div>

			<div className="relative w-full max-w-[280px]">
				<SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={searchInput}
					onChange={(event) => onSearchInputChange(event.target.value)}
					placeholder="Search files..."
					className="pl-9"
				/>
			</div>

			{!detail.files.length ? (
				<Empty className="border">
					<EmptyHeader>
						<EmptyTitle>No records found.</EmptyTitle>
						<EmptyDescription>This folder has no files yet.</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<div className="space-y-3">
					{detail.files.map((file) => (
						<ContextMenu key={file.id}>
							<ContextMenuTrigger>
								<div
									className="cursor-pointer rounded-xl border bg-background p-4 shadow-sm"
									onClick={() => openPreview(file)}
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex min-w-0 items-start gap-2">
											<div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
												<FileIcon className="size-4" />
											</div>
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold text-foreground">
													{file.filename}
												</p>
												<p className="mt-0.5 text-xs text-muted-foreground">
													{file.mime_type}
												</p>
											</div>
										</div>
										<Badge className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
											{file.proof_type.replaceAll("_", " ")}
										</Badge>
									</div>
									<div className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
										<p>
											<span className="font-medium text-foreground">Size:</span>{" "}
											{formatFileSize(file.size_bytes)}
										</p>
										<p>
											<span className="font-medium text-foreground">Created:</span>{" "}
											{formatDate(file.created_at)}
										</p>
										<p>
											<span className="font-medium text-foreground">Proof:</span>{" "}
											{file.proof_type.replaceAll("_", " ")}
										</p>
										<p>
											<span className="font-medium text-foreground">File ID:</span>{" "}
											{file.id.slice(0, 8).toUpperCase()}
										</p>
									</div>
								</div>
							</ContextMenuTrigger>
							<ContextMenuContent className="w-52">
								<ContextMenuItem onSelect={onSyncProcessing}>
									Sync processing
								</ContextMenuItem>
								<ContextMenuItem
									onSelect={() => openPreview(file)}
								>
									Preview file
								</ContextMenuItem>
								<ContextMenuItem asChild>
									<Link href={file.public_url} target="_blank" rel="noreferrer">
										Open file
									</Link>
								</ContextMenuItem>
								<ContextMenuItem onSelect={() => handleContextAction("Copy file ID")}>
									Copy file ID
								</ContextMenuItem>
							</ContextMenuContent>
						</ContextMenu>
					))}
				</div>
			)}

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

			{activeFile ? (
				<FileViewerModal
					open={Boolean(activeFile)}
					onOpenChange={(open) => {
						if (!open) setActiveFile(null);
					}}
					file={{
						filename: activeFile.filename,
						mime_type: activeFile.mime_type,
						public_url: activeFile.public_url,
					}}
				/>
			) : null}
		</div>
	);
};
