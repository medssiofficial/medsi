"use client";

import { cn } from "../../lib/utils";
import { Spinner } from "../ui/spinner";
import { PatientTopBar } from "./patient-top-bar";
import { PatientBottomNav } from "./patient-bottom-nav";
import type { PatientShellProps, BottomNavItem } from "./types";

export function PatientShell({
	user,
	navItems,
	notificationCount = 0,
	isLoading = false,
	onNotificationClick,
	onAvatarClick,
	onNavItemClick,
	children,
}: PatientShellProps & {
	onNavItemClick?: (item: BottomNavItem) => void;
}) {
	return (
		<div className="flex min-h-svh flex-col bg-background">
			<PatientTopBar
				user={user}
				notificationCount={notificationCount}
				isLoading={isLoading}
				onNotificationClick={onNotificationClick}
				onAvatarClick={onAvatarClick}
			/>

			<main
				className={cn(
					"flex-1 overflow-y-auto",
					"pb-[72px] md:pb-[88px]",
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

			<PatientBottomNav
				items={navItems}
				onItemClick={onNavItemClick}
			/>
		</div>
	);
}
