"use client";

import type { DoctorFolderDetail } from "@/services/api/admin/files/get-doctor-folder-detail";
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
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import Link from "next/link";
import { useDoctorFolderContent } from "./hook";

interface DoctorFolderContentProps {
	detail: DoctorFolderDetail | null;
	isLoading: boolean;
	onSyncProcessing: () => void;
}

export const DoctorFolderContent = (props: DoctorFolderContentProps) => {
	const { detail, isLoading, onSyncProcessing } = props;
	const { formatDate, formatFileSize, handleContextAction } = useDoctorFolderContent();

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
					Sync Processing
				</Button>
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
								<div className="rounded-xl border bg-background p-4">
									<div className="flex items-center justify-between gap-2">
										<p className="truncate text-sm font-medium text-foreground">
											{file.filename}
										</p>
										<span className="text-xs text-muted-foreground">
											{file.proof_type.replaceAll("_", " ")}
										</span>
									</div>
									<p className="mt-1 text-xs text-muted-foreground">
										{file.mime_type} • {formatFileSize(file.size_bytes)} • {formatDate(file.created_at)}
									</p>
								</div>
							</ContextMenuTrigger>
							<ContextMenuContent className="w-48">
								<ContextMenuItem onSelect={onSyncProcessing}>
									Sync processing
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
		</div>
	);
};
