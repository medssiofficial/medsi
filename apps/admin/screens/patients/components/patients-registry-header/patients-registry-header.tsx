"use client";

import { Input } from "@repo/ui/components/ui/input";
import { Search } from "lucide-react";

interface PatientsRegistryHeaderProps {
	searchInput: string;
	onSearchInputChange: (value: string) => void;
}

export const PatientsRegistryHeader = (
	props: PatientsRegistryHeaderProps,
) => {
	const { searchInput, onSearchInputChange } = props;

	return (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<h2 className="font-heading text-2xl font-bold text-foreground">
				Patient Registry
			</h2>

			<div className="relative w-full max-w-[240px]">
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={searchInput}
					onChange={(event) => onSearchInputChange(event.target.value)}
					placeholder="Search patients..."
					className="h-9 rounded-[10px] border-border pl-9"
				/>
			</div>
		</div>
	);
};
