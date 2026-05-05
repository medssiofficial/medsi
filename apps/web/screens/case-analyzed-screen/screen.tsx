"use client";

import {
	AlertTriangleIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	BrainIcon,
	GaugeIcon,
	GlobeIcon,
	ShieldAlertIcon,
	StethoscopeIcon,
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useCaseAnalyzedScreen } from "./hook";

const severityTone = (severity: string) => {
	const lower = severity.toLowerCase();
	if (lower === "high") return "bg-red-100 text-red-700";
	if (lower === "medium" || lower === "med") return "bg-amber-100 text-amber-700";
	return "bg-green-100 text-green-700";
};

const CaseAnalyzedScreen = () => {
	const { caseData, analysis, isLoading, handleContinueToReview, handleGoBack } =
		useCaseAnalyzedScreen();

	if (isLoading) {
		return (
			<div className="flex min-h-dvh flex-col px-5 py-6">
				<Skeleton className="h-6 w-32" />
				<Skeleton className="mt-6 h-16 w-16 self-center rounded-full" />
				<Skeleton className="mt-4 h-6 w-40 self-center" />
				<Skeleton className="mt-2 h-4 w-56 self-center" />
				<div className="mt-6 space-y-3">
					<Skeleton className="h-16 w-full rounded-xl" />
					<Skeleton className="h-16 w-full rounded-xl" />
					<Skeleton className="h-16 w-full rounded-xl" />
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-dvh flex-col px-5 py-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<button type="button" onClick={handleGoBack} className="p-1">
					<ArrowLeftIcon className="size-5 text-font-primary" />
				</button>
				<h2 className="text-base font-semibold text-font-primary">AI Intake</h2>
				<div className="flex items-center gap-1 rounded-full border px-2 py-1">
					<GlobeIcon className="size-3.5 text-font-secondary" />
					<span className="text-xs text-font-secondary">
						{caseData?.language?.toUpperCase() ?? "EN"}
					</span>
				</div>
			</div>

			{/* Icon + Title */}
			<div className="mt-8 flex flex-col items-center gap-3">
				<div className="flex size-16 items-center justify-center rounded-full bg-green-100">
					<StethoscopeIcon className="size-8 text-green-700" />
				</div>
				<h1 className="text-xl font-bold text-font-primary">Case Analyzed</h1>
				<p className="text-sm text-font-secondary">AI has processed your intake</p>
			</div>

			{/* AI Disclaimer */}
			<div className="mt-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
				<AlertTriangleIcon className="size-4 shrink-0 text-amber-600" />
				<p className="text-xs text-amber-800">
					AI-generated content. Always verify with your healthcare provider.
				</p>
			</div>

			{/* Analysis Cards */}
			{analysis && (
				<div className="mt-6 space-y-3">
					{/* Detected Specialty */}
					<div className="flex items-center gap-3 rounded-xl border bg-background p-4">
						<div className="flex size-10 items-center justify-center rounded-full bg-[#0F6E6E]/10">
							<BrainIcon className="size-5 text-[#0F6E6E]" />
						</div>
						<div>
							<p className="text-xs text-font-secondary">Detected Specialty</p>
							<p className="text-sm font-semibold text-font-primary">
								{analysis.detected_specialty ?? "Not determined"}
							</p>
						</div>
					</div>

					{/* Urgency Level */}
					<div className="flex items-center gap-3 rounded-xl border bg-background p-4">
						<div className="flex size-10 items-center justify-center rounded-full bg-amber-100">
							<ShieldAlertIcon className="size-5 text-amber-700" />
						</div>
						<div>
							<p className="text-xs text-font-secondary">Urgency Level</p>
							<p className="text-sm font-semibold text-font-primary">
								{analysis.urgency_level ?? "Unknown"}
							</p>
						</div>
					</div>

					{/* AI Confidence */}
					<div className="flex items-center gap-3 rounded-xl border bg-background p-4">
						<div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
							<GaugeIcon className="size-5 text-blue-700" />
						</div>
						<div>
							<p className="text-xs text-font-secondary">AI Confidence</p>
							<p className="text-sm font-semibold text-font-primary">
								{analysis.ai_confidence != null ? `${analysis.ai_confidence}%` : "N/A"}
							</p>
						</div>
					</div>

					{/* Key Symptoms */}
					{analysis.key_symptoms.length > 0 && (
						<div className="rounded-xl border bg-background p-4">
							<p className="text-xs font-medium text-font-secondary">
								Key Symptoms Identified ({analysis.key_symptoms.length})
							</p>
							<div className="mt-3 space-y-2">
								{analysis.key_symptoms.map((symptom, idx) => (
									<div key={idx} className="flex items-center justify-between gap-2">
										<span className="text-sm text-font-primary">{symptom.description}</span>
										<Badge className={`rounded-full px-2 py-0.5 text-xs ${severityTone(symptom.severity)}`}>
											{symptom.severity}
										</Badge>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Note */}
			<p className="mt-6 text-center text-xs text-font-secondary">
				If anything looks incorrect, you can edit before submitting.
			</p>

			{/* CTA */}
			<div className="mt-auto pt-6">
				<Button
					type="button"
					onClick={handleContinueToReview}
					className="h-12 w-full rounded-xl text-base"
				>
					Continue to Full Review
					<ArrowRightIcon className="ml-2 size-4" />
				</Button>
			</div>
		</div>
	);
};

export default CaseAnalyzedScreen;
