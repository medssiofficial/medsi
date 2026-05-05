"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { useAdminPatientFileProcessingLogsQuery } from "@/services/api/admin/files/get-patient-file-processing-logs";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

const PatientFileProcessingLogsScreen = () => {
	const query = useAdminPatientFileProcessingLogsQuery({ page: 1, page_size: 30 });

	return (
		<AdminShell>
			<div className="max-w-4xl space-y-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="font-heading text-2xl font-bold text-foreground">
							Patient file processing logs
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Audit trail for Gemini text-report processing (patient uploads, manual runs,
							and bulk jobs).
						</p>
					</div>
					<Button variant="outline" size="sm" className="w-fit" asChild>
						<Link href="/settings" className="inline-flex items-center gap-2">
							<ArrowLeftIcon className="size-4" />
							Back to settings
						</Link>
					</Button>
				</div>

				<div className="rounded-xl border bg-background">
					{query.isLoading ? (
						<div className="space-y-3 p-4">
							{Array.from({ length: 6 }).map((_, i) => (
								<Skeleton key={i} className="h-16 w-full" />
							))}
						</div>
					) : query.isError ? (
						<p className="p-4 text-sm text-destructive">Could not load logs.</p>
					) : (query.data?.items.length ?? 0) === 0 ? (
						<p className="p-4 text-sm text-muted-foreground">No records found.</p>
					) : (
						<ul className="divide-y">
							{query.data?.items.map((row) => (
								<li key={row.id} className="p-4 text-sm">
									<p className="font-medium text-foreground">
										{row.file.filename}{" "}
										<span className="text-muted-foreground">
											· {row.outcome} · {row.source.replaceAll("_", " ")}
										</span>
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{new Date(row.created_at).toLocaleString()}
										{row.gemini_model ? ` · ${row.gemini_model}` : ""}
										{row.file.user.profile?.email
											? ` · ${row.file.user.profile.email}`
											: ""}
									</p>
									{row.error_message ? (
										<p className="mt-2 text-xs text-destructive">{row.error_message}</p>
									) : null}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</AdminShell>
	);
};

export default PatientFileProcessingLogsScreen;
