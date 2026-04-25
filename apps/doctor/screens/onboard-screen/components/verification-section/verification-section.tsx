"use client";

import type { DoctorMe } from "@/services/api/doctor/get-me";
import { Button } from "@repo/ui/components/ui/button";
import { Separator } from "@repo/ui/components/ui/separator";
import { cn } from "@repo/ui/lib/utils";
import { useVerificationSection } from "./hook";

export const VerificationSection = (props: {
	doctor: DoctorMe | null;
	completionPercent: number;
	canSubmit: boolean;
}) => {
	const { doctor, completionPercent, canSubmit } = props;
	const { statusCards, isSubmitting, handleSubmit } = useVerificationSection({
		doctor,
		completionPercent,
		canSubmit,
	});

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-3">
				<div className="flex flex-col gap-0.5">
					<p className="font-heading text-base font-semibold">
						6. Verification Status
					</p>
					<p className="text-sm text-muted-foreground">
						Submit your profile for verification once all sections are complete.
					</p>
				</div>
				<Button
					type="button"
					onClick={handleSubmit}
					disabled={!canSubmit || isSubmitting}
				>
					Submit for Verification
				</Button>
			</div>

			<Separator />

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				{statusCards.map((card) => (
					<div
						key={card.title}
						className={cn(
							"rounded-lg border border-border px-3 py-3 flex flex-col gap-1",
							card.tone === "good" && "bg-emerald-50",
							card.tone === "warn" && "bg-amber-50",
							card.tone === "info" && "bg-blue-50",
							card.tone === "muted" && "bg-muted",
						)}
					>
						<p className="text-sm font-medium">{card.title}</p>
						<p className="text-xs text-muted-foreground">{card.subtitle}</p>
					</div>
				))}
			</div>

			<p className="text-xs text-muted-foreground">
				Completion: {completionPercent}%
			</p>
		</div>
	);
};
