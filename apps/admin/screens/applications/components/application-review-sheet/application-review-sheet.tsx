"use client";

import type { AdminApplicationDetail } from "@/services/api/admin/applications/types";
import type { DoctorApplicationStatus } from "@repo/database/actions/doctor";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Separator } from "@repo/ui/components/ui/separator";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { CheckCircle2, FileText, Lock, X } from "lucide-react";
import Image from "next/image";
import { type DocumentItem, useApplicationReviewSheet } from "./hook";

interface ApplicationReviewSheetProps {
	open: boolean;
	onClose: () => void;
	application: AdminApplicationDetail | null;
	isLoading: boolean;
	isSubmitting: boolean;
	onUpdateStatus: (args: {
		application_id: string;
		status: DoctorApplicationStatus;
		rejection_reason?: string;
	}) => Promise<void>;
}

const STATUS_OPTIONS: Array<{
	value: DoctorApplicationStatus;
	label: string;
}> = [
	{ value: "pending", label: "Pending" },
	{ value: "under_review", label: "Under Review" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
];

const SKELETON_KEYS = Array.from({ length: 7 }, (_, i) => `skel-${i}`);

const isPreviewableMime = (mime: string | null) => {
	if (!mime) return false;
	return (
		mime.startsWith("image/") || mime === "application/pdf"
	);
};

const DocPreview = ({ doc }: { doc: DocumentItem }) => {
	if (!doc.file_url) return null;

	if (doc.mime_type?.startsWith("image/")) {
		return (
			<div className="h-full overflow-auto">
				<Image
					src={doc.file_url}
					alt={doc.label}
					width={1600}
					height={1200}
					unoptimized
					className="h-full w-full object-contain"
				/>
			</div>
		);
	}

	if (doc.mime_type === "application/pdf") {
		return (
			<div className="h-full overflow-hidden">
				<iframe
					src={doc.file_url}
					title={doc.label}
					className="h-full w-full"
				/>
			</div>
		);
	}

	return null;
};

export const ApplicationReviewSheet = (props: ApplicationReviewSheetProps) => {
	const {
		open,
		onClose,
		application,
		isLoading,
		isSubmitting,
		onUpdateStatus,
	} = props;

	const {
		applicantFields,
		expertiseItems,
		specializationItems,
		experienceItems,
		submittedDocuments,
		selectedStatus,
		setSelectedStatus,
		rejectionReason,
		setRejectionReason,
		reasonError,
		handleApplyStatus,
		isStatusLocked,
		previewDoc,
		handleDocClick,
	} = useApplicationReviewSheet({
		application,
		onUpdateStatus,
	});

	if (!open) return null;
	const activePreviewDoc =
		previewDoc && previewDoc.file_url && isPreviewableMime(previewDoc.mime_type)
			? previewDoc
			: null;

	return (
		<div className="mt-4 overflow-hidden rounded-lg border bg-muted/30">
			<div className="flex min-h-[560px] items-stretch">
				<div className="w-full max-w-[520px] overflow-y-auto bg-background">
				{/* Header */}
				<div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
					<h2 className="font-heading text-lg font-semibold">
						Application Review
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-muted-foreground transition-colors hover:text-foreground"
					>
						<X className="size-5" />
					</button>
				</div>

				{/* Content */}
				<div className="px-6 py-5">
					{isLoading ? (
						<div className="space-y-4">
							{SKELETON_KEYS.map((key) => (
								<Skeleton key={key} className="h-5 w-full" />
							))}
						</div>
					) : !application ? (
						<p className="text-sm text-muted-foreground">
							Select an application to review.
						</p>
					) : (
						<div className="space-y-6">
							{/* Applicant Details */}
							<section className="space-y-3">
								<h3 className="font-heading text-sm font-semibold">
									Doctor Details
								</h3>
								<div className="space-y-0.5">
									{applicantFields.map((field) => (
										<div
											key={field.label}
											className="flex items-baseline justify-between gap-4 py-1.5"
										>
											<span className="shrink-0 text-[13px] text-muted-foreground">
												{field.label}
											</span>
											<span className="max-w-[62%] wrap-break-word text-right text-[13px] font-medium text-foreground">
												{field.value}
											</span>
										</div>
									))}
								</div>
							</section>

							<Separator />

							<section className="space-y-3">
								<h3 className="font-heading text-sm font-semibold">Expertise</h3>
								{expertiseItems.length === 0 ? (
									<p className="text-sm text-muted-foreground">-</p>
								) : (
									<div className="flex flex-wrap gap-1.5">
										{expertiseItems.map((item) => (
											<Badge key={item} variant="secondary" className="rounded-full">
												{item}
											</Badge>
										))}
									</div>
								)}
							</section>

							<Separator />

							<section className="space-y-3">
								<h3 className="font-heading text-sm font-semibold">Specializations</h3>
								{specializationItems.length === 0 ? (
									<p className="text-sm text-muted-foreground">-</p>
								) : (
									<div className="space-y-2">
										{specializationItems.map((item) => (
											<div
												key={`${item.name}-${item.certificate}`}
												className="rounded-md border px-3 py-2"
											>
												<p className="text-sm font-medium">{item.name}</p>
												<p className="wrap-break-word text-xs text-muted-foreground">
													Certificate: {item.certificate}
												</p>
											</div>
										))}
									</div>
								)}
							</section>

							<Separator />

							<section className="space-y-3">
								<h3 className="font-heading text-sm font-semibold">Experience</h3>
								{experienceItems.length === 0 ? (
									<p className="text-sm text-muted-foreground">-</p>
								) : (
									<div className="space-y-2">
										{experienceItems.map((item, index) => (
											<div
												key={`${item.hospital}-${item.startDate}-${index}`}
												className="rounded-md border px-3 py-2"
											>
												<p className="text-sm font-medium">{item.hospital}</p>
												<p className="text-xs text-muted-foreground">
													{item.startDate} - {item.endDate} ({item.duration})
												</p>
												<p className="mt-1 wrap-break-word text-xs text-muted-foreground">
													{item.description}
												</p>
												<p className="mt-1 wrap-break-word text-xs text-muted-foreground">
													Proof: {item.proof}
												</p>
											</div>
										))}
									</div>
								)}
							</section>

							<Separator />

							{/* Documents Submitted */}
							<section className="space-y-3">
								<h3 className="font-heading text-sm font-semibold">
									Documents Submitted
								</h3>
								{submittedDocuments.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No documents uploaded yet.
									</p>
								) : (
									<div className="space-y-2">
										{submittedDocuments.map((doc) => (
											<div key={`${doc.label}-${doc.file_key}`}>
												<button
													type="button"
													onClick={() => handleDocClick(doc)}
													disabled={
														!doc.file_url || !isPreviewableMime(doc.mime_type)
													}
													className="flex h-9 w-full items-center justify-between rounded-md bg-muted px-3 transition-colors hover:bg-muted/80 disabled:cursor-default disabled:hover:bg-muted"
												>
													<div className="flex items-center gap-2 overflow-hidden">
														<FileText className="size-4 shrink-0 text-muted-foreground" />
														<span className="truncate text-[13px]">
															{doc.label}
														</span>
													</div>
													<Badge
														variant="outline"
														className="ml-2 shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700"
													>
														<CheckCircle2 className="mr-1 size-3" />
														Uploaded
													</Badge>
												</button>

											</div>
										))}
									</div>
								)}
							</section>

							{application.rejection_reason &&
							application.status === "rejected" ? (
								<>
									<Separator />
									<section className="space-y-2">
										<h3 className="font-heading text-sm font-semibold">
											Rejection Reason
										</h3>
										<p className="text-sm text-muted-foreground">
											{application.rejection_reason}
										</p>
									</section>
								</>
							) : null}

							<Separator />

							{/* Action section */}
							{isStatusLocked ? (
								<section className="space-y-3">
									<div className="flex items-center gap-2 text-muted-foreground">
										<Lock className="size-4" />
										<p className="text-sm">
											This application has been{" "}
											<span className="font-medium text-foreground">
												{application.status === "approved"
													? "approved"
													: "rejected"}
											</span>
											. Status can no longer be changed.
										</p>
									</div>
									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={onClose}
									>
										Close
									</Button>
								</section>
							) : (
								<section className="space-y-3">
									<div className="space-y-2">
										<label className="text-xs font-medium text-muted-foreground">
											Update Status
										</label>
										<div className="grid grid-cols-2 gap-2">
											{STATUS_OPTIONS.map((option) => (
												<Button
													key={option.value}
													type="button"
													variant={
														selectedStatus === option.value
															? "default"
															: "outline"
													}
													size="sm"
													className="h-8 text-xs"
													onClick={() => setSelectedStatus(option.value)}
													disabled={isSubmitting}
												>
													{option.label}
												</Button>
											))}
										</div>
									</div>

									{selectedStatus === "rejected" ? (
										<div className="space-y-1">
											<Textarea
												value={rejectionReason}
												onChange={(e) => setRejectionReason(e.target.value)}
												placeholder="Reason for rejection..."
												rows={3}
												disabled={isSubmitting}
											/>
											{reasonError ? (
												<p className="text-xs text-destructive">
													{reasonError}
												</p>
											) : null}
										</div>
									) : null}

									<div className="flex gap-2">
										<Button
											type="button"
											className="h-10 flex-1"
											onClick={() => void handleApplyStatus()}
											disabled={isSubmitting}
										>
											Apply Status
										</Button>
										<Button
											type="button"
											variant="outline"
											className="h-10 flex-1"
											onClick={onClose}
											disabled={isSubmitting}
										>
											Close
										</Button>
									</div>
								</section>
							)}
						</div>
					)}
				</div>
				</div>

				{activePreviewDoc ? (
					<div className="flex-1 border-l bg-background p-4">
						<div className="mb-3 flex items-center justify-between gap-2">
							<p className="truncate text-sm font-medium">{activePreviewDoc.label}</p>
							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={() => handleDocClick(activePreviewDoc)}
							>
								Close Preview
							</Button>
						</div>
						<div className="h-[calc(100%-40px)] overflow-hidden rounded-md border bg-card">
							<DocPreview doc={activePreviewDoc} />
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
};
