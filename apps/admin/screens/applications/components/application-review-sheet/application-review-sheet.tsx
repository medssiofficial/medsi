"use client";

import type { AdminApplicationDetail } from "@/services/api/admin/applications/types";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Separator } from "@repo/ui/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@repo/ui/components/ui/sheet";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { FileText } from "lucide-react";
import { useApplicationReviewSheet } from "./hook";

interface ApplicationReviewSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	application: AdminApplicationDetail | null;
	isLoading: boolean;
	isSubmitting: boolean;
	onApprove: (applicationId: string) => Promise<void>;
	onReject: (args: { application_id: string; rejection_reason: string }) => Promise<void>;
}

const STATUS_VARIANT_MAP: Record<string, "default" | "secondary" | "destructive" | "outline"> =
	{
		approved: "default",
		rejected: "destructive",
		under_review: "secondary",
		pending: "outline",
	};

const STATUS_LABEL_MAP: Record<string, string> = {
	approved: "Approved",
	rejected: "Rejected",
	under_review: "Under Review",
	pending: "Pending",
};

export const ApplicationReviewSheet = (props: ApplicationReviewSheetProps) => {
	const {
		open,
		onOpenChange,
		application,
		isLoading,
		isSubmitting,
		onApprove,
		onReject,
	} = props;

	const {
		applicantFields,
		submittedDocuments,
		isRejectDialogOpen,
		setIsRejectDialogOpen,
		rejectionReason,
		setRejectionReason,
		reasonError,
		handleApprove,
		openRejectDialog,
		handleReject,
	} = useApplicationReviewSheet({
		application,
		onApprove,
		onReject,
	});

	return (
		<>
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent side="right" className="w-full sm:max-w-[560px] p-0">
					<SheetHeader className="border-b px-6 py-4">
						<div className="flex items-center justify-between gap-3">
							<div className="space-y-1">
								<SheetTitle>Application Review</SheetTitle>
								<SheetDescription>
									Review the doctor application and submitted documents.
								</SheetDescription>
							</div>
							{application ? (
								<Badge
									variant={STATUS_VARIANT_MAP[application.status] ?? "outline"}
									className="rounded-full"
								>
									{STATUS_LABEL_MAP[application.status] ?? application.status}
								</Badge>
							) : null}
						</div>
					</SheetHeader>

					<ScrollArea className="h-[calc(100vh-180px)] px-6 py-5">
						{isLoading ? (
							<div className="space-y-4">
								{Array.from({ length: 8 }, (_, index) => (
									<Skeleton key={index} className="h-5 w-full" />
								))}
							</div>
						) : !application ? (
							<p className="text-sm text-muted-foreground">
								Select an application to review.
							</p>
						) : (
							<div className="space-y-6">
								<section className="space-y-3">
									<h3 className="font-heading text-sm font-semibold text-foreground">
										Applicant Details
									</h3>
									<div className="space-y-2">
										{applicantFields.map((field) => (
											<div
												key={field.label}
												className="flex items-start justify-between gap-3 rounded-md bg-muted/50 px-3 py-2"
											>
												<p className="text-xs text-muted-foreground">
													{field.label}
												</p>
												<p className="max-w-60 text-right text-sm text-foreground">
													{field.value}
												</p>
											</div>
										))}
									</div>
								</section>

								<Separator />

								<section className="space-y-3">
									<h3 className="font-heading text-sm font-semibold text-foreground">
										Documents Submitted
									</h3>
									{submittedDocuments.length === 0 ? (
										<p className="text-sm text-muted-foreground">
											No documents uploaded yet.
										</p>
									) : (
										<div className="space-y-2">
											{submittedDocuments.map((doc) => (
												<div
													key={`${doc.label}-${doc.file_key}`}
													className="flex items-center gap-2 rounded-md bg-muted px-3 py-2"
												>
													<FileText className="size-4 text-muted-foreground" />
													<div className="min-w-0">
														<p className="text-sm text-foreground">
															{doc.label}
														</p>
														<p className="truncate text-xs text-muted-foreground">
															{doc.file_name}
														</p>
													</div>
												</div>
											))}
										</div>
									)}
								</section>

								{application.rejection_reason ? (
									<>
										<Separator />
										<section className="space-y-1">
											<h3 className="font-heading text-sm font-semibold text-foreground">
												Rejection reason
											</h3>
											<p className="text-sm text-muted-foreground">
												{application.rejection_reason}
											</p>
										</section>
									</>
								) : null}
							</div>
						)}
					</ScrollArea>

					<div className="border-t px-6 py-4">
						<div className="flex flex-col gap-2">
							<Button
								type="button"
								onClick={() => void handleApprove()}
								disabled={
									isSubmitting ||
									!application ||
									application.status === "approved"
								}
							>
								Approve Application
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={openRejectDialog}
								disabled={
									isSubmitting ||
									!application ||
									application.status === "rejected"
								}
							>
								Reject Application
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			<Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject application</DialogTitle>
						<DialogDescription>
							Provide a reason so the doctor understands what to fix before
							reapplying.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<Input value={application?.id ?? ""} disabled />
						<Textarea
							value={rejectionReason}
							onChange={(event) => setRejectionReason(event.target.value)}
							placeholder="Explain why this application is being rejected..."
							rows={4}
						/>
						{reasonError ? (
							<p className="text-xs text-destructive">{reasonError}</p>
						) : null}
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsRejectDialogOpen(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={() => void handleReject()}
							disabled={isSubmitting}
						>
							Confirm Reject
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
