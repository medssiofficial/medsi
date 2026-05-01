"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { UploadIcon } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { useFilesUpload } from "./hook";

interface FilesUploadProps {
	isUploading: boolean;
	onUploadFile: (file: File) => void;
}

export const FilesUpload = (props: FilesUploadProps) => {
	const { isUploading, onUploadFile } = props;
	const { acceptedTypes } = useFilesUpload();
	const inputRef = useRef<HTMLInputElement | null>(null);

	const handlePickFile = () => {
		if (isUploading) return;
		inputRef.current?.click();
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		onUploadFile(file);
		event.currentTarget.value = "";
	};

	return (
		<div className="rounded-2xl border border-border-subtle bg-background p-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-sm font-semibold text-font-primary">Upload documents</p>
					<p className="text-xs text-font-secondary">
						Pre-upload records to your secure folder.
					</p>
				</div>
				<Button
					type="button"
					onClick={handlePickFile}
					disabled={isUploading}
					className="rounded-xl px-4"
				>
					<UploadIcon className="mr-1.5 size-4" />
					{isUploading ? "Uploading..." : "Upload File"}
				</Button>
			</div>

			<Input
				ref={inputRef}
				type="file"
				accept={acceptedTypes}
				className="hidden"
				onChange={handleFileChange}
			/>
		</div>
	);
};
