"use client";

import { AlertTriangleIcon, BrainIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useCaseAnalyzingScreen } from "./hook";

const CaseAnalyzingScreen = () => {
	const { steps, isLoading } = useCaseAnalyzingScreen();

	if (isLoading) {
		return (
			<div className="min-h-dvh bg-neutral-warm">
				<div className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col items-center justify-center gap-6 px-4 md:px-6">
					<Skeleton className="h-16 w-16 rounded-full" />
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-64" />
					<div className="w-full max-w-xs space-y-3">
						<Skeleton className="h-10 w-full rounded-xl" />
						<Skeleton className="h-10 w-full rounded-xl" />
						<Skeleton className="h-10 w-full rounded-xl" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-dvh bg-neutral-warm">
			<div className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col items-center justify-center px-4 py-10 md:px-6">
				<div className="flex w-full max-w-sm flex-col items-center gap-6">
					<div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-950/40">
						<AlertTriangleIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-300" />
						<p className="text-xs text-amber-800 dark:text-amber-200">
						AI-generated content. Always verify with your healthcare provider.
					</p>
				</div>

					<div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
						<BrainIcon className="size-10 text-primary" />
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
										? "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/40"
										: step.done
											? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/40"
											: "border-border-subtle bg-muted"
								}`}
							>
								{step.done ? (
									<CheckCircle2Icon className="size-5 shrink-0 text-emerald-600 dark:text-emerald-200" />
								) : isInProgress ? (
									<Loader2Icon className="size-5 shrink-0 animate-spin text-amber-600 dark:text-amber-200" />
								) : (
									<div className="size-5 shrink-0 rounded-full border-2 border-border-subtle" />
								)}
								<span
									className={`text-sm font-medium ${
										isInProgress
											? "text-amber-800 dark:text-amber-200"
											: step.done
												? "text-emerald-700 dark:text-emerald-200"
												: "text-font-secondary"
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
		</div>
	);
};

export default CaseAnalyzingScreen;
