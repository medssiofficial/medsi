"use client";

import type { PatientFileDetail } from "@repo/database/actions/patient";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import Link from "next/link";
import { FILES_URL } from "@/config/client-constants";
import { useFileDetailContent } from "./hook";

interface FileDetailContentProps {
	file: PatientFileDetail | null;
	isLoading: boolean;
	onProcess: () => void;
	isProcessing: boolean;
}

const isProcessedPayload = (
	data: unknown,
): data is {
	version: 1;
	summary: {
		title: string;
		key_findings: string[];
		possible_diagnoses_or_conditions: string[];
		medications_or_treatments_mentioned: string[];
		dates_and_follow_up: string[];
		patient_actions_recommended: string[];
		confidence_notes?: string;
	};
	extracted_text: string;
	extracted_text_truncated?: boolean;
	model?: string;
} => {
	if (!data || typeof data !== "object") return false;
	const o = data as { version?: unknown; summary?: unknown; extracted_text?: unknown };
	return o.version === 1 && typeof o.summary === "object" && typeof o.extracted_text === "string";
};

export const FileDetailContent = (props: FileDetailContentProps) => {
	const { toProcessingTone } = useFileDetailContent();

	if (props.isLoading) {
		return (
			<div className="space-y-3 rounded-2xl border bg-background p-4">
				<Skeleton className="h-6 w-48" />
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	if (!props.file) {
		return (
			<p className="text-sm text-font-secondary">File not found or you no longer have access.</p>
		);
	}

	const { file } = props;
	const processed = isProcessedPayload(file.processed_data) ? file.processed_data : null;

	return (
		<div className="space-y-5">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0 space-y-2">
					<h1 className="truncate text-lg font-semibold text-font-primary">{file.filename}</h1>
					<div className="flex flex-wrap items-center gap-2 text-xs text-font-secondary">
						<Badge className={`rounded-full px-2.5 py-0.5 ${toProcessingTone(file.processing_status)}`}>
							{file.processing_status}
						</Badge>
						<span>{file.report_type.replace("_", " ")}</span>
						<span>{file.mime_type}</span>
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button type="button" variant="outline" size="sm" asChild>
						<Link href={FILES_URL}>Back to files</Link>
					</Button>
					<Button
						type="button"
						size="sm"
						disabled={
							props.isProcessing ||
							(file.report_type === "text_report" &&
								file.processing_status !== "pending" &&
								file.processing_status !== "failed")
						}
						onClick={props.onProcess}
					>
						{props.isProcessing ? "Queueing…" : "Process with AI"}
					</Button>
					{file.public_url ? (
						<Button asChild type="button" size="sm" variant="secondary">
							<Link href={file.public_url} target="_blank" rel="noreferrer">
								View document
							</Link>
						</Button>
					) : null}
				</div>
			</div>

			{processed ? (
				<div className="space-y-5">
					<div className="rounded-2xl border bg-background p-4 shadow-sm">
						<p className="text-xs font-medium uppercase tracking-wide text-font-tertiary">
							Summary
						</p>
						<h2 className="mt-2 text-base font-semibold text-font-primary">
							{processed.summary.title}
						</h2>
						{processed.model ? (
							<p className="mt-1 text-xs text-font-tertiary">Model: {processed.model}</p>
						) : null}
						<div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
							<div>
								<p className="font-medium text-font-primary">Key findings</p>
								<ul className="mt-2 list-disc space-y-1 pl-5 text-font-secondary">
									{processed.summary.key_findings.map((x, i) => (
										<li key={`kf-${i}-${x.slice(0, 48)}`}>{x}</li>
									))}
								</ul>
							</div>
							<div>
								<p className="font-medium text-font-primary">Possible conditions</p>
								<ul className="mt-2 list-disc space-y-1 pl-5 text-font-secondary">
									{processed.summary.possible_diagnoses_or_conditions.map((x, i) => (
										<li key={`dx-${i}-${x.slice(0, 48)}`}>{x}</li>
									))}
								</ul>
							</div>
							<div>
								<p className="font-medium text-font-primary">Medications / treatments</p>
								<ul className="mt-2 list-disc space-y-1 pl-5 text-font-secondary">
									{processed.summary.medications_or_treatments_mentioned.map((x, i) => (
										<li key={`med-${i}-${x.slice(0, 48)}`}>{x}</li>
									))}
								</ul>
							</div>
							<div>
								<p className="font-medium text-font-primary">Dates & follow-up</p>
								<ul className="mt-2 list-disc space-y-1 pl-5 text-font-secondary">
									{processed.summary.dates_and_follow_up.map((x, i) => (
										<li key={`dt-${i}-${x.slice(0, 48)}`}>{x}</li>
									))}
								</ul>
							</div>
							<div className="md:col-span-2">
								<p className="font-medium text-font-primary">Recommended actions</p>
								<ul className="mt-2 list-disc space-y-1 pl-5 text-font-secondary">
									{processed.summary.patient_actions_recommended.map((x, i) => (
										<li key={`act-${i}-${x.slice(0, 48)}`}>{x}</li>
									))}
								</ul>
							</div>
							{processed.summary.confidence_notes ? (
								<div className="md:col-span-2 text-xs text-font-tertiary">
									{processed.summary.confidence_notes}
								</div>
							) : null}
						</div>
					</div>

					<div className="rounded-2xl border bg-background p-4 shadow-sm">
						<div className="flex items-center justify-between gap-2">
							<p className="text-xs font-medium uppercase tracking-wide text-font-tertiary">
								Extracted text
							</p>
							{processed.extracted_text_truncated ? (
								<Badge variant="outline" className="text-xs">
									Truncated for storage
								</Badge>
							) : null}
						</div>
						<pre className="mt-3 max-h-[480px] overflow-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-xs text-font-secondary">
							{processed.extracted_text}
						</pre>
					</div>
				</div>
			) : (
				<div className="rounded-2xl border border-dashed bg-background p-6 text-center text-sm text-font-secondary">
					{file.processing_status === "processing"
						? "Processing in progress… This page refreshes automatically."
						: file.processing_status === "failed"
							? "Processing failed. Try running processing again."
							: file.processing_status === "not_supported"
								? "This file type is not supported for automated processing yet."
								: "No processed summary yet. Start processing to generate a summary and extracted text."}
				</div>
			)}
		</div>
	);
};
