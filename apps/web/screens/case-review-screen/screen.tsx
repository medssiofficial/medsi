"use client";

import {
	AlertTriangleIcon,
	ArrowLeftIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	FileIcon,
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useCaseReviewScreen } from "./hook";

const urgencyTone = (level: string | null) => {
	if (!level) return "bg-gray-100 text-gray-700";
	const lower = level.toLowerCase();
	if (lower === "high" || lower === "urgent") return "bg-red-100 text-red-700";
	if (lower === "moderate" || lower === "medium") return "bg-amber-100 text-amber-700";
	return "bg-green-100 text-green-700";
};

const CaseReviewScreen = () => {
	const {
		caseData,
		analysis,
		collectedInfo,
		dimensionScores,
		expandedSections,
		toggleSection,
		isLoading,
		handleContinueToMatching,
		handleGoBack,
	} = useCaseReviewScreen();

	if (isLoading) {
		return (
			<div className="flex min-h-dvh flex-col px-5 py-6">
				<Skeleton className="h-6 w-24" />
				<Skeleton className="mt-6 h-20 w-full rounded-xl" />
				<Skeleton className="mt-4 h-32 w-full rounded-xl" />
				<Skeleton className="mt-4 h-16 w-full rounded-xl" />
			</div>
		);
	}

	const sections = [
		{ key: "symptoms", label: "Symptoms", items: collectedInfo?.symptoms ?? [] },
		{ key: "medical_history", label: "Medical History", items: collectedInfo?.medical_history ?? [] },
		{ key: "medications", label: "Medications", items: collectedInfo?.medications ?? [] },
		{ key: "allergies", label: "Allergies", items: collectedInfo?.allergies ?? [] },
	];

	return (
		<div className="flex min-h-dvh flex-col px-5 py-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<button type="button" onClick={handleGoBack} className="p-1">
					<ArrowLeftIcon className="size-5 text-font-primary" />
				</button>
				<h2 className="text-base font-semibold text-font-primary">Review</h2>
			</div>

			{/* AI Disclaimer */}
			<div className="mt-5 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
				<AlertTriangleIcon className="size-4 shrink-0 text-amber-600" />
				<p className="text-xs text-amber-800">
					AI-generated content. Always verify with your healthcare provider.
				</p>
			</div>

			{/* AI Summary */}
			{analysis && (
				<div className="mt-5 rounded-xl border bg-background p-4">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold text-font-primary">AI Summary</h3>
						{analysis.urgency_level && (
							<Badge className={`rounded-full px-2 py-0.5 text-xs ${urgencyTone(analysis.urgency_level)}`}>
								{analysis.urgency_level}
							</Badge>
						)}
					</div>
					{analysis.ai_summary && (
						<p className="mt-2 text-sm leading-relaxed text-font-secondary">
							{analysis.ai_summary}
						</p>
					)}
					{dimensionScores.length > 0 && (
						<div className="mt-4 space-y-2">
							{dimensionScores.map((score) => (
								<div key={score.label} className="flex items-center justify-between">
									<span className="text-xs capitalize text-font-secondary">
										{score.label.replace(/_/g, " ")}
									</span>
									<div className="flex items-center gap-2">
										<div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
											<div
												className="h-full rounded-full bg-[#0F6E6E]"
												style={{ width: `${Math.min(score.value * 10, 100)}%` }}
											/>
										</div>
										<span className="text-xs font-medium text-font-primary">{score.value}</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Collected Information */}
			<div className="mt-5 space-y-2">
				{sections.map((section) => {
					const isExpanded = expandedSections.includes(section.key);
					return (
						<div key={section.key} className="rounded-xl border bg-background">
							<button
								type="button"
								onClick={() => toggleSection(section.key)}
								className="flex w-full items-center justify-between px-4 py-3"
							>
								<span className="text-sm font-medium text-font-primary">
									{section.label}
									{section.items.length > 0 && (
										<span className="ml-1 text-font-secondary">({section.items.length})</span>
									)}
								</span>
								{isExpanded ? (
									<ChevronDownIcon className="size-4 text-font-secondary" />
								) : (
									<ChevronRightIcon className="size-4 text-font-secondary" />
								)}
							</button>
							{isExpanded && (
								<div className="border-t px-4 py-3">
									{section.items.length === 0 ? (
										<p className="text-xs text-font-secondary">No data collected</p>
									) : (
										<ul className="space-y-1.5">
											{section.items.map((item, idx) => (
												<li key={idx} className="text-sm text-font-secondary">
													• {typeof item === "string" ? item : JSON.stringify(item)}
												</li>
											))}
										</ul>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Attached Files */}
			{caseData && caseData.files.length > 0 && (
				<div className="mt-5">
					<p className="text-xs font-medium text-font-secondary">Attached Files</p>
					<div className="mt-2 flex flex-wrap gap-2">
						{caseData.files.map((cf) => (
							<div
								key={cf.id}
								className="flex items-center gap-1.5 rounded-full border bg-gray-50 px-3 py-1.5"
							>
								<FileIcon className="size-3.5 text-font-secondary" />
								<span className="max-w-[120px] truncate text-xs text-font-primary">
									{cf.file.filename}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* CTA */}
			<div className="mt-auto pt-6">
				<Button
					type="button"
					onClick={handleContinueToMatching}
					className="h-12 w-full rounded-xl text-base"
				>
					Continue to Matching
				</Button>
			</div>
		</div>
	);
};

export default CaseReviewScreen;
