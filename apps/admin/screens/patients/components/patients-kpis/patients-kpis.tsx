"use client";

import type { PatientRegistrySummary } from "@/services/api/admin/patients/get-patients";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

interface PatientsKpisProps {
	summary: PatientRegistrySummary | null;
	isLoading: boolean;
}

const formatCount = (value: number) =>
	new Intl.NumberFormat("en-US").format(value);

export const PatientsKpis = (props: PatientsKpisProps) => {
	const { summary, isLoading } = props;

	const cards: Array<{
		label: string;
		valueKey: keyof PatientRegistrySummary;
		valueClassName: string;
	}> = [
		{
			label: "Active Patients",
			valueKey: "active_patients",
			valueClassName: "text-foreground",
		},
		{
			label: "Urgent Cases",
			valueKey: "urgent_cases",
			valueClassName: "text-destructive",
		},
		{
			label: "Pending Reviews",
			valueKey: "pending_reviews",
			valueClassName: "text-amber-800 dark:text-amber-600",
		},
	];

	return (
		<div className="grid gap-4 sm:grid-cols-3">
			{cards.map((card) => (
				<div
					key={card.label}
					className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-4"
				>
					<p className="text-[13px] text-muted-foreground">{card.label}</p>
					{isLoading ? (
						<Skeleton className="h-8 w-24" />
					) : (
						<p
							className={`font-heading text-[28px] font-bold leading-none tabular-nums ${card.valueClassName}`}
						>
							{summary ? formatCount(summary[card.valueKey]) : "—"}
						</p>
					)}
				</div>
			))}
		</div>
	);
};
