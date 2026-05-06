"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
	LoaderCircleIcon,
	ImageIcon,
	FileTextIcon,
	FileSpreadsheetIcon,
	LayoutGridIcon,
	MicIcon,
	MicOffIcon,
	PaperclipIcon,
	SendIcon,
	UploadIcon,
	FileIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { useConsultationChatInput } from "./hook";

interface CurrentQuestion {
	id: string;
	question_text: string;
	response_type: "text" | "file";
}

interface ConsultationChatInputProps {
	inputText: string;
	onInputChange: (value: string) => void;
	onSend: () => void;
	onSkip: () => void;
	onAttach: () => void;
	onMic: () => void;
	isRecording: boolean;
	isSending: boolean;
	disabled: boolean;
	currentQuestion: CurrentQuestion | null;
	showFilePicker: boolean;
	onCloseFilePicker: () => void;
	onFileUpload: (file: File) => void;
	onSelectExistingFile: (fileId: string, filename: string) => void;
}

export const ConsultationChatInput = (props: ConsultationChatInputProps) => {
	const {
		inputText,
		onInputChange,
		onSend,
		onSkip,
		onAttach,
		onMic,
		isRecording,
		isSending,
		disabled,
		currentQuestion,
		showFilePicker,
		onCloseFilePicker,
		onFileUpload,
		onSelectExistingFile,
	} = props;

	const {
		existingFiles,
		isLoadingFiles,
		hasNextPage,
		isFetchingNextPage,
		loadMore,
		setSentinelRef,
	} = useConsultationChatInput();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const isFileOnlyQuestion = currentQuestion?.response_type === "file";
	const [pickerTab, setPickerTab] = useState<"files" | "upload">("files");
	const getThumbKind = (filename: string) => {
		const lower = filename.toLowerCase();
		if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp")) return "image";
		if (lower.endsWith(".pdf")) return "pdf";
		if (lower.endsWith(".txt")) return "text";
		return "other";
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSend();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			onFileUpload(file);
			e.target.value = "";
		}
	};

	if (disabled) {
		return (
			<div className="flex shrink-0 items-center justify-center border-t border-border-subtle bg-neutral-warm py-4">
				<p className="text-sm text-font-secondary">
					This conversation has ended.
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="flex shrink-0 items-center gap-2 border-t border-border-subtle bg-neutral-warm pb-6 pt-3">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
					onClick={onSkip}
					disabled={isSending}
				>
					Skip
				</Button>

				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					className="text-muted-foreground"
					onClick={onAttach}
					aria-label="Attach file"
					disabled={isSending}
				>
					<PaperclipIcon className="size-[22px]" />
				</Button>

				<div className="flex min-w-0 flex-1 items-center gap-1 rounded-full bg-muted px-1">
					<input
						type="text"
						value={inputText}
						onChange={(e) => onInputChange(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={
							isFileOnlyQuestion
								? "This question requires a file. Use attach."
								: "Type a message..."
						}
						className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
						disabled={isSending || isFileOnlyQuestion}
						readOnly={isFileOnlyQuestion}
					/>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					className={
						isRecording
							? "animate-pulse text-red-500"
							: "text-muted-foreground"
					}
					onClick={onMic}
					aria-label={isRecording ? "Stop recording" : "Voice input"}
					disabled={isSending || isFileOnlyQuestion}
				>
					{isRecording ? (
						<MicOffIcon className="size-[22px]" />
					) : (
						<MicIcon className="size-[22px]" />
					)}
				</Button>

				<Button
					type="button"
					size="icon"
					className="size-10 shrink-0 rounded-full bg-[#0F6E6E] text-white hover:bg-[#0c5a5a]"
					onClick={onSend}
					aria-label="Send message"
					disabled={isSending || !inputText.trim() || isFileOnlyQuestion}
				>
					{isSending ? (
						<LoaderCircleIcon className="size-[18px] animate-spin" />
					) : (
						<SendIcon className="size-[18px]" />
					)}
				</Button>
			</div>

			<Dialog
				open={showFilePicker}
				onOpenChange={(open) => {
					if (!open) onCloseFilePicker();
					if (open) setPickerTab("files");
				}}
			>
				<DialogContent className="h-[84svh] w-[92vw] max-w-[720px] overflow-hidden rounded-2xl p-0 sm:h-[76svh]">
					<DialogHeader>
						<div className="border-b px-6 py-4">
							<DialogTitle>Attach a File</DialogTitle>
						</div>
					</DialogHeader>

					<div className="flex h-[calc(84svh-72px)] flex-col px-5 pb-5 pt-3 sm:h-[calc(76svh-72px)]">
						<Tabs
							value={pickerTab}
							onValueChange={(value) =>
								setPickerTab(value as "files" | "upload")
							}
							className="flex h-full flex-col"
						>
							<TabsList className="w-full">
								<TabsTrigger value="files">Current Files</TabsTrigger>
								<TabsTrigger value="upload">Upload New</TabsTrigger>
							</TabsList>

							<TabsContent
								value="files"
								className="mt-4 min-h-0 flex-1 rounded-xl border bg-muted/20 p-3"
							>
								{isLoadingFiles ? (
									<p className="text-sm text-font-secondary">Loading files...</p>
								) : existingFiles.length === 0 ? (
									<div className="flex h-full items-center justify-center text-center text-sm text-font-secondary">
										No existing files found.
									</div>
								) : (
									<div className="flex h-full min-h-0 flex-col">
										<div className="mb-2 inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-[11px] text-font-secondary">
											<LayoutGridIcon className="size-3.5" />
											Thumbnail view
										</div>
										<div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid-cols-3 lg:grid-cols-4">
											{existingFiles.map((f) => (
												<button
													key={f.id}
													type="button"
													className="aspect-square w-full min-w-0 rounded-md border bg-background p-1 text-left transition hover:border-primary/50 hover:bg-muted"
													onClick={() => onSelectExistingFile(f.id, f.filename)}
												>
													<div className="flex h-[78%] w-full items-center justify-center rounded-md border bg-muted/30">
														{getThumbKind(f.filename) === "image" ? (
															<ImageIcon className="size-9 text-emerald-500" />
														) : getThumbKind(f.filename) === "pdf" ? (
															<FileSpreadsheetIcon className="size-9 text-rose-500" />
														) : getThumbKind(f.filename) === "text" ? (
															<FileTextIcon className="size-9 text-sky-500" />
														) : (
															<FileIcon className="size-9 text-muted-foreground" />
														)}
													</div>
													<p className="mt-1 truncate text-[10px] font-medium text-font-primary">
														{f.filename}
													</p>
												</button>
											))}
											<div ref={setSentinelRef} className="h-1 w-full lg:col-span-3" />
										</div>
										<div className="mt-3 flex flex-col items-center gap-2">
											{isFetchingNextPage ? (
												<p className="text-xs text-font-secondary">Loading more...</p>
											) : hasNextPage ? (
												<Button type="button" variant="outline" size="sm" onClick={loadMore}>
													Load more
												</Button>
											) : (
												<p className="text-xs text-font-secondary">No more to show.</p>
											)}
										</div>
									</div>
								)}
							</TabsContent>

							<TabsContent
								value="upload"
								className="mt-4 min-h-0 flex-1 rounded-xl border bg-muted/20 p-4"
							>
								<input
									ref={fileInputRef}
									type="file"
									accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
									className="hidden"
									onChange={handleFileChange}
								/>
								<div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-background px-6 py-10 text-center">
									<UploadIcon className="size-8 text-muted-foreground" />
									<p className="text-base font-medium text-font-primary">
										Upload a new file
									</p>
									<p className="text-sm text-font-secondary">
										PDF, image, or text files are supported.
									</p>
									<Button
										type="button"
										variant="outline"
										className="justify-start gap-2"
										onClick={() => fileInputRef.current?.click()}
									>
										<UploadIcon className="size-4" />
										Choose file
									</Button>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
