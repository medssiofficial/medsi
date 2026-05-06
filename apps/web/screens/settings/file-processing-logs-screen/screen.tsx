"use client";

import { PatientAppShell } from "@/components/common";
import { SETTINGS_URL } from "@/config/client-constants";
import { usePatientFileProcessingLogsQuery } from "@/services/api/patient/get-file-processing-logs";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";

export const FileProcessingLogsScreen = () => {
	const [page, setPage] = useState(1);
	const query = usePatientFileProcessingLogsQuery({ page, page_size: 20 });
	const meta = query.data?.meta;

	return (
		<PatientAppShell title="File processing logs">
			<div className="mx-auto max-w-3xl space-y-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm text-font-secondary">
							Automated summaries and text extraction (Gemini). Newest first.
						</p>
					</div>
					<Button variant="outline" size="sm" className="w-fit" asChild>
						<Link href={SETTINGS_URL} className="inline-flex items-center gap-2">
							<ArrowLeftIcon className="size-4" />
							Back to settings
						</Link>
					</Button>
				</div>

				<div className="rounded-2xl border border-border-subtle bg-card shadow-sm">
					{query.isLoading ? (
						<div className="space-y-3 p-4">
							{Array.from({ length: 6 }).map((_, i) => (
								<Skeleton key={i} className="h-14 w-full" />
							))}
						</div>
					) : query.isError ? (
						<p className="p-4 text-sm text-destructive">Could not load logs.</p>
					) : (query.data?.items.length ?? 0) === 0 ? (
						<p className="p-4 text-sm text-font-secondary">No records found.</p>
					) : (
						<ul className="divide-y divide-border-subtle">
							{query.data?.items.map((row) => (
								<li key={row.id} className="p-4 text-sm">
									<p className="font-medium text-font-primary">
										{row.file.filename}{" "}
										<span className="text-font-tertiary">
											· {row.outcome} · {row.source.replaceAll("_", " ")}
										</span>
									</p>
									<p className="mt-1 text-xs text-font-tertiary">
										{new Date(row.created_at).toLocaleString()}
										{row.gemini_model ? ` · ${row.gemini_model}` : ""}
									</p>
									{row.error_message ? (
										<p className="mt-2 text-xs text-destructive">{row.error_message}</p>
									) : null}
								</li>
							))}
						</ul>
					)}
				</div>
				<div className="flex items-center justify-end gap-2">
					<Button
						type="button"
						size="sm"
						variant="outline"
						disabled={query.isLoading || !(meta?.has_previous_page ?? false)}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
					>
						Previous
					</Button>
					<span className="text-xs text-font-tertiary">
						Page {meta?.page ?? page} of {Math.max(meta?.total_pages ?? 1, 1)}
					</span>
					<Button
						type="button"
						size="sm"
						variant="outline"
						disabled={query.isLoading || !(meta?.has_next_page ?? false)}
						onClick={() => setPage((p) => p + 1)}
					>
						Next
					</Button>
				</div>
			</div>
		</PatientAppShell>
	);
};
