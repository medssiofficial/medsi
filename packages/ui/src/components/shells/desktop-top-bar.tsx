"use client";

import { Fragment } from "react";
import { BellIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Skeleton } from "../ui/skeleton";
import type { TopBarConfig, ShellUser } from "./types";

interface DesktopTopBarProps {
	config?: TopBarConfig;
	user?: ShellUser | null;
	isLoading?: boolean;
	onSearch?: (query: string) => void;
	onNotificationClick?: () => void;
	onUserMenuClick?: () => void;
	className?: string;
}

export function DesktopTopBar({
	config = {},
	user,
	isLoading = false,
	onSearch,
	onNotificationClick,
	onUserMenuClick,
	className,
}: DesktopTopBarProps) {
	const {
		breadcrumbs = [],
		showSearch = true,
		searchPlaceholder = "Search...",
		showNotifications = true,
		notificationCount = 0,
	} = config;

	return (
		<header
			className={cn(
				"flex h-14 items-center gap-4 border-b border-border bg-background px-6",
				className,
			)}
		>
			{isLoading ? (
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-24" />
				</div>
			) : (
				breadcrumbs.length > 0 && (
					<Breadcrumb>
						<BreadcrumbList>
							{breadcrumbs.map((crumb, i) => {
								const isLast = i === breadcrumbs.length - 1;
								return (
									<Fragment key={`${crumb.label}-${i}`}>
										{i > 0 && <BreadcrumbSeparator />}
										<BreadcrumbItem>
											{isLast ? (
												<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
											) : (
												<BreadcrumbLink href={crumb.href ?? "#"}>
													{crumb.label}
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>
									</Fragment>
								);
							})}
						</BreadcrumbList>
					</Breadcrumb>
				)
			)}

			<div className="flex-1" />

			{showSearch && (
				<div className="flex h-9 w-72 items-center gap-2 rounded-lg border border-border bg-secondary px-3">
					<SearchIcon size={16} className="text-muted-foreground" aria-hidden="true" />
					<input
						type="text"
						placeholder={searchPlaceholder}
						aria-label={searchPlaceholder}
						className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
						onChange={(e) => onSearch?.(e.target.value)}
						disabled={isLoading}
					/>
				</div>
			)}

			{showNotifications && (
				<button
					type="button"
					aria-label={
						notificationCount > 0
							? `Notifications (${notificationCount} unread)`
							: "Notifications"
					}
					onClick={onNotificationClick}
					disabled={isLoading}
					className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary disabled:opacity-50"
				>
					<BellIcon size={20} className="text-muted-foreground" />
					{notificationCount > 0 && (
						<span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
					)}
				</button>
			)}

			{isLoading ? (
				<div className="flex items-center gap-2">
					<Skeleton className="size-8 rounded-full" />
					<Skeleton className="h-4 w-4" />
				</div>
			) : (
				user && (
					<button
						type="button"
						aria-label={`User menu for ${user.name}`}
						onClick={onUserMenuClick}
						className="flex items-center gap-2 hover:opacity-80"
					>
						<Avatar size="default">
							{user.avatarUrl && (
								<AvatarImage src={user.avatarUrl} alt={user.name} />
							)}
							<AvatarFallback>{user.initials}</AvatarFallback>
						</Avatar>
						<ChevronDownIcon size={16} className="text-muted-foreground" />
					</button>
				)
			)}
		</header>
	);
}
