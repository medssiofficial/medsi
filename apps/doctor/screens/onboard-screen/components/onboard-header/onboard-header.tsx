"use client";

import { Progress } from "@repo/ui/components/ui/progress";
import { useOnboardHeader } from "./hook";

export const OnboardHeader = () => {
	const { completionPercent } = useOnboardHeader();

	return (
		<header className="w-full border-b border-border bg-background">
			<div className="mx-auto w-full max-w-3xl px-4 py-3 flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<p className="font-heading text-lg font-semibold">Medssi</p>
					<p className="text-sm text-muted-foreground">Doctor Panel</p>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<p>Profile completion</p>
						<p>{completionPercent}%</p>
					</div>
					<Progress value={completionPercent} />
				</div>
			</div>
		</header>
	);
};
