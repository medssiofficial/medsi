"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Input } from "@repo/ui/components/ui/input";
import { Search } from "lucide-react";
import type { AdminApplicationStatusFilter } from "@/services/api/admin/applications/get-applications";
import { cn } from "@repo/ui/lib/utils";
import { useApplicationsToolbar } from "./hook";

interface ApplicationsToolbarProps {
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	status: AdminApplicationStatusFilter;
	statusTabs: Array<{
		value: AdminApplicationStatusFilter;
		label: string;
	}>;
	onStatusChange: (status: AdminApplicationStatusFilter) => void;
	pendingCount: number;
}

export const ApplicationsToolbar = (props: ApplicationsToolbarProps) => {
	const {
		searchInput,
		onSearchInputChange,
		status,
		statusTabs,
		onStatusChange,
		pendingCount,
	} = props;

	const { pendingCountLabel } = useApplicationsToolbar({ pendingCount });

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2.5">
					<h2 className="font-heading text-2xl font-bold text-foreground">
						Applications
					</h2>
					<Badge variant="default" className="rounded-full">
						{pendingCountLabel}
					</Badge>
				</div>

				<div className="relative w-full max-w-60">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={searchInput}
						onChange={(event) => onSearchInputChange(event.target.value)}
						placeholder="Search applications..."
						className="pl-9"
					/>
				</div>
			</div>

			<div className="flex items-center gap-1 border-b border-border">
				{statusTabs.map((tab) => (
					<button
						key={tab.value}
						type="button"
						onClick={() => onStatusChange(tab.value)}
						className={cn(
							"border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
							status === tab.value
								? "border-foreground text-foreground"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}
					>
						{tab.label}
					</button>
				))}
			</div>
		</div>
	);
};
