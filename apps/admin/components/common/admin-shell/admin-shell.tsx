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
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { LogOut } from "lucide-react";

export const AdminShell = (props: { children: React.ReactNode }) => {
	const { children } = props;
	const { navItems, user, currentPageTitle, handleSignOut } = useAdminShell();

	return (
		<div className="min-h-svh w-full">
			<TooltipProvider>
				<SidebarProvider className={cn("min-h-svh w-full", "font-heading")}>
					<Sidebar collapsible="icon" className="sidebar-dark">
						<SidebarHeader className="px-4 pb-5 pt-6 text-sidebar-foreground">
							<AdminLogo size="md" variant="sidebar" />
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
												<Link
													href={item.href}
													prefetch={false}
												>
													<item.icon size={18} />
													<span className="flex-1">{item.label}</span>
													{typeof item.badge !== "undefined" ? (
														<span className="rounded-full bg-sidebar-foreground px-1.5 py-0.5 text-[10px] leading-none text-sidebar">
															{item.badge}
														</span>
													) : null}
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
											<div className="flex min-w-0 flex-1 flex-col items-start leading-tight">
												<span className="w-full truncate text-sm font-medium">
													{user?.name ?? "Admin"}
												</span>
												<span className="w-full truncate text-xs text-sidebar-foreground/60">
													{user?.email ?? ""}
												</span>
											</div>
										</SidebarMenuButton>
									</DropdownMenuTrigger>

									<DropdownMenuContent
										align="start"
										sideOffset={8}
										className="w-64"
									>
										<DropdownMenuLabel>
											<div className="flex items-center gap-2.5">
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
												<div className="flex min-w-0 flex-1 flex-col gap-0.5">
													<span className="w-full truncate text-sm">
														{user?.name ?? "Admin"}
													</span>
													<span className="w-full truncate text-xs text-muted-foreground">
														{user?.email ?? ""}
													</span>
												</div>
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
						<header className="flex h-14 items-center border-b bg-background px-6">
							<h1 className="font-heading text-lg font-semibold text-foreground">
								{currentPageTitle}
							</h1>
						</header>
						<main className="flex-1 p-6">{children}</main>
					</SidebarInset>
				</SidebarProvider>
			</TooltipProvider>
		</div>
	);
};
