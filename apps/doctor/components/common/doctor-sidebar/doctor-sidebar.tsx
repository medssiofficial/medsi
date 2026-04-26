"use client";

import { DoctorLogo } from "@repo/ui/components/brand/doctor";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@repo/ui/components/ui/sidebar";
import { cn } from "@repo/ui/lib/utils";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useDoctorSidebar } from "./hook";

export const DoctorSidebar = () => {
	const { navItems, onSignOut } = useDoctorSidebar();

	return (
		<Sidebar collapsible="none" className="sidebar-navy h-svh">
			<SidebarHeader className="px-4 pb-6 pt-6 text-sidebar-foreground">
				<DoctorLogo variant="sidebar" size="md" />
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={item.isActive}
										tooltip={item.label}
										className={cn(
											"h-10 gap-2.5 rounded-md px-3 text-sm",
											"text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground",
											item.isActive &&
												"bg-sidebar-accent text-sidebar-foreground font-medium",
										)}
									>
										<Link href={item.href} prefetch={false}>
											<item.icon size={18} />
											<span className="flex-1">{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="mt-auto px-2 pb-4">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={() => {
								void onSignOut();
							}}
							className={cn(
								"h-10 gap-2.5 rounded-md px-3 text-sm",
								"text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
							)}
						>
							<LogOut size={18} />
							<span>Sign Out</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
};

