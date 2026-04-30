"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { SearchIcon, RefreshCwIcon } from "lucide-react";
import { useFilesToolbar } from "./hook";

interface FilesToolbarProps {
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	onSyncProcessing: () => void;
}

export const FilesToolbar = (props: FilesToolbarProps) => {
	const { searchInput, onSearchInputChange, onSyncProcessing } = props;
	useFilesToolbar();

	return (
		<div className="flex flex-wrap items-center gap-3">
			<div className="relative w-full max-w-[280px]">
				<SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={searchInput}
					onChange={(event) => onSearchInputChange(event.target.value)}
					placeholder="Search folders..."
					className="pl-9"
				/>
			</div>
			<Button type="button" variant="outline" onClick={onSyncProcessing}>
				<RefreshCwIcon className="mr-1.5 size-4" />
				Sync Processing
			</Button>
		</div>
	);
};
