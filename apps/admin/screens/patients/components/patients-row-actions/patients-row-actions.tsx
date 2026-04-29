"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

interface PatientsRowActionsProps {
	patientName: string;
}

export const PatientsRowActions = (props: PatientsRowActionsProps) => {
	const { patientName } = props;

	const notify = (action: string) => {
		toast.info(`${action} — ${patientName}`, {
			description: "This action is not available yet.",
		});
	};

	return (
		<div className="flex justify-end">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						size="icon-sm"
						variant="ghost"
						className="text-muted-foreground"
						aria-label="Open actions"
					>
						<MoreHorizontal className="size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => notify("View profile")}>
						View profile
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => notify("Suspend account")}>
						Suspend account
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => notify("Deactivate account")}>
						Deactivate account
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
