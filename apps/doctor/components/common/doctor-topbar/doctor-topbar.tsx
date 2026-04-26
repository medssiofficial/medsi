"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { Bell } from "lucide-react";
import { useDoctorSidebar } from "../doctor-sidebar";
import { useDoctorTopbar } from "./hook";

export const DoctorTopbar = (props: { title: string }) => {
	const { title } = props;
	const { shellUser } = useDoctorSidebar();
	const { subtitle } = useDoctorTopbar({ title });

	return (
		<header className="flex h-16 items-center justify-between border-b bg-background px-6">
			<div className="min-w-0">
				<h1 className="truncate font-heading text-lg font-semibold text-foreground">
					{title}
				</h1>
				<p className="truncate text-xs text-muted-foreground">{subtitle}</p>
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon-sm"
					className="text-muted-foreground hover:text-foreground"
				>
					<Bell />
				</Button>
				<Avatar size="sm">
					{shellUser.avatarUrl ? (
						<AvatarImage src={shellUser.avatarUrl} alt={shellUser.name} />
					) : null}
					<AvatarFallback>{shellUser.initials}</AvatarFallback>
				</Avatar>
			</div>
		</header>
	);
};

