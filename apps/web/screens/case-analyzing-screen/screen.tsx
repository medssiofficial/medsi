"use client";

import { AlertTriangleIcon, BrainIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useCaseAnalyzingScreen } from "./hook";

const CaseAnalyzingScreen = () => {
	const { steps, isLoading } = useCaseAnalyzingScreen();

	if (isLoading) {
		return (
			<div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
				<Skeleton className="h-16 w-16 rounded-full" />
				<Skeleton className="h-6 w-48" />
				<Skeleton className="h-4 w-64" />
				<div className="space-y-3 w-full max-w-xs">
					<Skeleton className="h-10 w-full rounded-xl" />
					<Skeleton className="h-10 w-full rounded-xl" />
					<Skeleton className="h-10 w-full rounded-xl" />
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
			<div className="flex w-full max-w-sm flex-col items-center gap-6">
				<div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
					<AlertTriangleIcon className="size-4 shrink-0 text-amber-600" />
					<p className="text-xs text-amber-800">
						AI-generated content. Always verify with your healthcare provider.
					</p>
				</div>

				<div className="flex size-20 items-center justify-center rounded-full bg-[#0F6E6E]/10">
					<BrainIcon className="size-10 text-[#0F6E6E]" />
				</div>

				<div className="text-center">
					<h1 className="text-xl font-bold text-font-primary">Analyzing your case...</h1>
					<p className="mt-2 text-sm text-font-secondary">
						Our AI is reviewing your symptoms and building your medical profile
					</p>
				</div>

				<div className="w-full space-y-3">
					{steps.map((step) => {
						const isInProgress = !step.done && steps.indexOf(step) === steps.findIndex((s) => !s.done);

						return (
							<div
								key={step.label}
								className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
									isInProgress
										? "border-amber-200 bg-amber-50"
										: step.done
											? "border-green-200 bg-green-50"
											: "border-gray-200 bg-gray-50"
								}`}
							>
								{step.done ? (
									<CheckCircle2Icon className="size-5 shrink-0 text-green-600" />
								) : isInProgress ? (
									<Loader2Icon className="size-5 shrink-0 animate-spin text-amber-600" />
								) : (
									<div className="size-5 shrink-0 rounded-full border-2 border-gray-300" />
								)}
								<span
									className={`text-sm font-medium ${
										isInProgress
											? "text-amber-800"
											: step.done
												? "text-green-700"
												: "text-gray-500"
									}`}
								>
									{step.label}
								</span>
							</div>
						);
					})}
				</div>

				<p className="text-xs text-font-secondary">This usually takes a few seconds</p>
			</div>
		</div>
	);
};

export default CaseAnalyzingScreen;
