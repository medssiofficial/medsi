"use client";

import {
	SidebarInset,
	SidebarProvider,
} from "@repo/ui/components/ui/sidebar";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { DoctorSidebar } from "../doctor-sidebar";
import { DoctorTopbar } from "../doctor-topbar";
import { useDoctorAppShell } from "./hook";

export const DoctorAppShell = (props: {
	title: string;
	children: React.ReactNode;
}) => {
	const { title, children } = props;
	const shell = useDoctorAppShell({ title });

	return (
		<div className="h-svh w-full overflow-hidden">
			<TooltipProvider>
				<SidebarProvider className="h-svh w-full">
					<DoctorSidebar />
					<SidebarInset className="h-svh bg-grey-50">
						<DoctorTopbar title={shell.title} />
						<main className="flex-1 overflow-auto p-6">{children}</main>
					</SidebarInset>
				</SidebarProvider>
			</TooltipProvider>
		</div>
	);
};

