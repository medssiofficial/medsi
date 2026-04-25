"use client";

import { AdminLogo } from "@repo/ui/components/brand/admin";
import { cn } from "@repo/ui/lib/utils";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "@repo/ui/components/ui/sidebar";
import Link from "next/link";
import { useAdminShell } from "./hook";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { LogOut } from "lucide-react";

export const AdminShell = (props: { children: React.ReactNode }) => {
	const { children } = props;
	const { navItems, user, handleSignOut } = useAdminShell();

	return (
		<div className="min-h-svh w-full">
			<SidebarProvider className={cn("min-h-svh w-full", "font-heading")}>
				<Sidebar collapsible="icon" className="sidebar-dark">
					<SidebarHeader className="px-4 pb-5 pt-6 text-sidebar-foreground">
						<AdminLogo size="md" />
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
													"h-10 gap-2.5 rounded-md px-3 font-sans text-sm",
													"text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
													item.isActive &&
														"bg-sidebar-accent text-sidebar-foreground font-medium",
												)}
											>
												<Link href={item.href}>
													<item.icon size={18} />
													<span>{item.label}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>

					<SidebarFooter className="px-2 pb-4">
						<SidebarMenu>
							<SidebarMenuItem>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuButton
											tooltip="Profile"
											className={cn(
												"h-12 gap-2.5 rounded-md px-3 font-sans",
												"text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
											)}
										>
											<Avatar size="sm">
												{user?.avatarUrl ? (
													<AvatarImage
														src={user.avatarUrl}
														alt={user.name}
													/>
												) : null}
												<AvatarFallback>
													{user?.initials ?? "A"}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col items-start leading-tight">
												<span className="text-sm font-medium">
													{user?.name ?? "Admin"}
												</span>
												<span className="text-xs text-sidebar-foreground/60">
													{user?.email ?? ""}
												</span>
											</div>
										</SidebarMenuButton>
									</DropdownMenuTrigger>

									<DropdownMenuContent align="start" sideOffset={8}>
										<DropdownMenuLabel>
											<div className="flex flex-col gap-0.5">
												<span className="text-sm">
													{user?.name ?? "Admin"}
												</span>
												<span className="text-xs text-muted-foreground">
													{user?.email ?? ""}
												</span>
											</div>
										</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											variant="destructive"
											onSelect={() => {
												void handleSignOut();
											}}
										>
											<LogOut />
											Logout
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>
				</Sidebar>

				<SidebarInset className="bg-secondary">
					<main className="flex-1 p-6">{children}</main>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
};
