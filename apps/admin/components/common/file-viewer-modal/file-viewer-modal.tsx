"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import { useFileViewerModal } from "./hook";

interface FileViewerModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	file: {
		filename: string;
		mime_type: string;
		public_url: string | null;
	};
}

export const FileViewerModal = (props: FileViewerModalProps) => {
	const { open, onOpenChange, file } = props;
	const { getFileKind, getFileExtension } = useFileViewerModal();

	const kind = getFileKind(file.mime_type);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="h-[92vh] max-w-[96vw] p-0">
				<DialogHeader className="border-b px-6 py-4">
					<DialogTitle className="truncate text-base">{file.filename}</DialogTitle>
					<DialogDescription>
						{file.mime_type} {getFileExtension(file.filename) ? `• .${getFileExtension(file.filename)}` : ""}
					</DialogDescription>
				</DialogHeader>

				<div className="h-[calc(92vh-94px)] px-4 pb-4">
					{!file.public_url ? (
						<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
							Preview unavailable for this file.
						</div>
					) : kind === "image" ? (
						<div className="flex h-full items-center justify-center rounded-lg bg-muted/30 p-4">
							<Image
								src={file.public_url}
								alt={file.filename}
								width={1600}
								height={1200}
								unoptimized
								className="max-h-full max-w-full rounded-lg object-contain"
							/>
						</div>
					) : kind === "pdf" ? (
						<iframe
							src={file.public_url}
							title={file.filename}
							className="h-full w-full rounded-lg border"
						/>
					) : kind === "text" ? (
						<iframe
							src={file.public_url}
							title={file.filename}
							className="h-full w-full rounded-lg border bg-card"
						/>
					) : (
						<div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
							<p>Inline preview is not available for this file type.</p>
							<Button asChild type="button" variant="outline">
								<Link href={file.public_url} target="_blank" rel="noreferrer">
									Open in new tab
								</Link>
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};
