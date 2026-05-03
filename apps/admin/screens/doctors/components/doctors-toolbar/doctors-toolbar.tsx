"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Search } from "lucide-react";
import { useDoctorsToolbar } from "./hook";

interface DoctorsToolbarProps {
	totalDoctors: number;
	pendingApplicationsCount: number;
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	onEmbedMissing: () => void;
	isEmbedBulkLoading: boolean;
}

export const DoctorsToolbar = (props: DoctorsToolbarProps) => {
	const {
		totalDoctors,
		pendingApplicationsCount,
		searchInput,
		onSearchInputChange,
		onEmbedMissing,
		isEmbedBulkLoading,
	} = props;

	const { totalDoctorsLabel, pendingApplicationsLabel } = useDoctorsToolbar({
		totalDoctors,
		pendingApplicationsCount,
	});

	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex flex-wrap items-center gap-2.5">
				<h2 className="font-heading text-2xl font-bold text-foreground">Doctors</h2>
				<Badge variant="secondary" className="rounded-full">
					{totalDoctorsLabel}
				</Badge>
				<Badge variant="outline" className="rounded-full">
					{pendingApplicationsLabel}
				</Badge>
			</div>

			<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
				<Button
					type="button"
					variant="secondary"
					size="sm"
					className="w-full sm:w-auto"
					disabled={isEmbedBulkLoading}
					onClick={onEmbedMissing}
				>
					{isEmbedBulkLoading ? "Queueing…" : "Embed missing (verified)"}
				</Button>
				<div className="relative w-full max-w-56">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={searchInput}
						onChange={(event) => onSearchInputChange(event.target.value)}
						placeholder="Search doctors..."
						className="pl-9"
					/>
				</div>
			</div>
		</div>
	);
};
