"use client";

import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { Spinner } from "../ui/spinner";
import { TooltipProvider } from "../ui/tooltip";
import { DesktopSidebar } from "./desktop-sidebar";
import { DesktopTopBar } from "./desktop-top-bar";
import type { DesktopShellProps } from "./types";

export function DesktopShell({
	sidebarVariant = "dark",
	logo,
	sidebarConfig,
	topBarConfig,
	user,
	isLoading = false,
	loadingText = "Loading...",
	onSearch,
	onNotificationClick,
	onSignOut,
	onNavItemClick,
	onFooterItemClick,
	onUserMenuClick,
	className,
	children,
}: DesktopShellProps) {
	return (
		<TooltipProvider>
			<SidebarProvider className={className}>
				<DesktopSidebar
					variant={sidebarVariant}
					logo={logo}
					config={sidebarConfig}
					isLoading={isLoading}
					onNavItemClick={onNavItemClick}
					onFooterItemClick={(item) => {
						if (item.action === "sign-out") {
							onSignOut?.();
						}
						onFooterItemClick?.(item);
					}}
				/>
				<SidebarInset>
					<DesktopTopBar
						config={topBarConfig}
						user={user}
						isLoading={isLoading}
						onSearch={onSearch}
						onNotificationClick={onNotificationClick}
						onUserMenuClick={onUserMenuClick}
					/>
					<main className="flex-1 overflow-y-auto bg-secondary">
						{isLoading ? (
							<div className="flex h-full min-h-[60vh] items-center justify-center">
								<div className="flex flex-col items-center gap-3">
									<Spinner className="size-6 text-muted-foreground" />
									<p className="text-sm text-muted-foreground">
										{loadingText}
									</p>
								</div>
							</div>
						) : (
							children
						)}
					</main>
				</SidebarInset>
			</SidebarProvider>
		</TooltipProvider>
	);
}
