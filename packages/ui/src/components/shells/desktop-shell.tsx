"use client";

import { cn } from "../../lib/utils";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { Spinner } from "../ui/spinner";
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
	onSearch,
	onNotificationClick,
	onSignOut,
	onNavItemClick,
	onUserMenuClick,
	children,
}: DesktopShellProps) {
	return (
		<SidebarProvider>
			<DesktopSidebar
				variant={sidebarVariant}
				logo={logo}
				config={sidebarConfig}
				isLoading={isLoading}
				onNavItemClick={onNavItemClick}
				onFooterItemClick={(item) => {
					if (item.label === "Sign Out") {
						onSignOut?.();
					}
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
				<main
					className={cn(
						"flex-1 overflow-y-auto",
						sidebarVariant === "dark"
							? "bg-secondary"
							: "bg-secondary",
					)}
				>
					{isLoading ? (
						<div className="flex h-full min-h-[60vh] items-center justify-center">
							<div className="flex flex-col items-center gap-3">
								<Spinner className="size-6 text-muted-foreground" />
								<p className="text-sm text-muted-foreground">
									Loading...
								</p>
							</div>
						</div>
					) : (
						children
					)}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
