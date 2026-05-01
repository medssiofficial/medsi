"use client";

import type { PatientDashboardOverview } from "@/services/api/patient/get-dashboard";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { FileTextIcon, StethoscopeIcon } from "lucide-react";
import { useDashboardContent } from "./hook";

interface DashboardContentProps {
	overview: PatientDashboardOverview | undefined;
	isLoading: boolean;
	isRefreshing: boolean;
	onStartConsultation: () => void;
}

export const DashboardContent = (props: DashboardContentProps) => {
	const { overview, isLoading, isRefreshing, onStartConsultation } = props;
	const { formatDate, toStatusLabel, toStatusTone } = useDashboardContent();

	return (
		<div className="space-y-5">
			<div className="rounded-2xl bg-primary p-5 text-primary-foreground">
				<p className="text-2xl font-bold">Hello 👋</p>
				<div className="mt-4 grid grid-cols-2 gap-3">
					<div className="rounded-lg bg-primary-dark p-3">
						<p className="text-2xl font-bold tabular-nums">
							{isLoading ? "--" : overview?.active_cases ?? 0}
						</p>
						<p className="text-xs text-primary-foreground/80">Active Cases</p>
					</div>
					<div className="rounded-lg bg-primary-dark p-3">
						<p className="text-2xl font-bold tabular-nums">
							{isLoading ? "--" : overview?.completed_cases ?? 0}
						</p>
						<p className="text-xs text-primary-foreground/80">Completed</p>
					</div>
				</div>
			</div>

			<Button
				type="button"
				onClick={onStartConsultation}
				className="h-auto w-full justify-between rounded-2xl border border-primary-dark bg-primary p-5 text-left text-primary-foreground hover:bg-primary/90"
			>
				<span>
					<span className="block text-base font-semibold">
						{overview?.has_ongoing_case
							? "Resume Ongoing Consultation"
							: "Start New Consultation"}
					</span>
					<span className="mt-1 block text-sm text-primary-foreground/80">
						Talk to our AI assistant
					</span>
				</span>
				<span className="flex size-12 items-center justify-center rounded-xl bg-white">
					<StethoscopeIcon className="size-5 text-primary" />
				</span>
			</Button>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-font-primary">My Cases</h2>
					{isRefreshing ? (
						<span className="text-xs text-font-secondary">Refreshing...</span>
					) : null}
				</div>

				{isLoading ? (
					<div className="space-y-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<div key={index} className="rounded-2xl border bg-background p-4">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="mt-3 h-3 w-full" />
								<Skeleton className="mt-2 h-3 w-3/4" />
							</div>
						))}
					</div>
				) : (overview?.recent_cases.length ?? 0) === 0 ? (
					<div className="rounded-2xl border border-dashed bg-background p-8 text-center">
						<p className="text-sm font-medium text-font-primary">No records found.</p>
						<p className="mt-1 text-xs text-font-secondary">
							Your consultations will appear here when created.
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{overview?.recent_cases.map((item) => (
							<div
								key={item.id}
								className="space-y-3 rounded-2xl border bg-background p-4"
							>
								<div className="flex items-center justify-between gap-2">
									<p className="text-sm font-semibold text-font-primary">
										#{item.id.slice(0, 10).toUpperCase()}
									</p>
									<Badge
										className={`rounded-full px-2.5 py-1 text-xs ${toStatusTone(item.conversation_status)}`}
									>
										{toStatusLabel(item.conversation_status)}
									</Badge>
								</div>
								<p className="line-clamp-2 text-sm text-font-secondary">
									{item.summary?.trim() || "No summary available yet."}
								</p>
								<div className="flex items-center justify-between text-xs text-font-secondary">
									<span>{formatDate(item.created_at)}</span>
									<span className="inline-flex items-center gap-1">
										<FileTextIcon className="size-3.5" />
										{item.file_count} files
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};
