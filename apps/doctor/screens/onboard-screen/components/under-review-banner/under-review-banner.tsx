"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { useUnderReviewBanner } from "./hook";

export const UnderReviewBanner = () => {
	useUnderReviewBanner();

	return (
		<div className="w-full rounded-lg border border-border bg-muted px-4 py-3 flex items-start gap-3">
			<Badge variant="secondary">Under review</Badge>
			<div className="flex flex-col gap-0.5">
				<p className="text-sm font-medium">Your application is under review</p>
				<p className="text-sm text-muted-foreground">
					We will notify you once verification is completed.
				</p>
			</div>
		</div>
	);
};
