"use client";

import { Input } from "@repo/ui/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/ui/select";
import { Search } from "lucide-react";
import { useMedicalCasesToolbar } from "./hook";

interface MedicalCasesToolbarProps {
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	stage: string;
	onStageChange: (value: string) => void;
	status: string;
	onStatusChange: (value: string) => void;
}

export const MedicalCasesToolbar = (props: MedicalCasesToolbarProps) => {
	const {
		searchInput,
		onSearchInputChange,
		stage,
		onStageChange,
		status,
		onStatusChange,
	} = props;

	const { stageOptions, statusOptions } = useMedicalCasesToolbar();

	return (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<h2 className="font-heading text-2xl font-bold text-foreground">
				Medical Cases
			</h2>

			<div className="flex flex-wrap items-center gap-3">
				<Select value={stage} onValueChange={onStageChange}>
					<SelectTrigger className="h-9 w-[160px]">
						<SelectValue placeholder="All Stages" />
					</SelectTrigger>
					<SelectContent>
						{stageOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={status} onValueChange={onStatusChange}>
					<SelectTrigger className="h-9 w-[160px]">
						<SelectValue placeholder="All Statuses" />
					</SelectTrigger>
					<SelectContent>
						{statusOptions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<div className="relative w-full max-w-[240px]">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={searchInput}
						onChange={(event) => onSearchInputChange(event.target.value)}
						placeholder="Search cases..."
						className="h-9 rounded-[10px] border-border pl-9"
					/>
				</div>
			</div>
		</div>
	);
};
