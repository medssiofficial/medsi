"use client";

import { BellIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { ClientLogo } from "../brand/client";
import type { ShellUser } from "./types";

interface PatientTopBarProps {
	user?: ShellUser | null;
	notificationCount?: number;
	isLoading?: boolean;
	onNotificationClick?: () => void;
	onAvatarClick?: () => void;
	className?: string;
}

export function PatientTopBar({
	user,
	notificationCount = 0,
	isLoading = false,
	onNotificationClick,
	onAvatarClick,
	className,
}: PatientTopBarProps) {
	return (
		<header
			className={cn(
				"flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-5",
				className,
			)}
		>
			<ClientLogo size="sm" />

			<div className="flex items-center gap-4">
				<button
					type="button"
					aria-label={
						notificationCount > 0
							? `Notifications (${notificationCount} unread)`
							: "Notifications"
					}
					onClick={onNotificationClick}
					disabled={isLoading}
					className="relative flex size-10 items-center justify-center rounded-full bg-secondary disabled:opacity-50"
				>
					<BellIcon size={20} className="text-muted-foreground" />
					{notificationCount > 0 && (
						<span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
					)}
				</button>

				{isLoading ? (
					<Skeleton className="size-10 rounded-full" />
				) : (
					user && (
						<button
							type="button"
							aria-label={`Account menu for ${user.name}`}
							onClick={onAvatarClick}
						>
							<Avatar size="default" className="size-10">
								{user.avatarUrl && (
									<AvatarImage
										src={user.avatarUrl}
										alt={user.name}
									/>
								)}
								<AvatarFallback className="bg-muted text-muted-foreground font-semibold text-sm">
									{user.initials}
								</AvatarFallback>
							</Avatar>
						</button>
					)
				)}
			</div>
		</header>
	);
}
