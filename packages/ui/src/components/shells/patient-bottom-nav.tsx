"use client";

import { cn } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";
import type { BottomNavItem } from "./types";

interface PatientBottomNavProps {
	items: BottomNavItem[];
	isLoading?: boolean;
	onItemClick?: (item: BottomNavItem) => void;
	className?: string;
}

export function PatientBottomNav({
	items,
	isLoading = false,
	onItemClick,
	className,
}: PatientBottomNavProps) {
	return (
		<nav
			aria-label="Primary navigation"
			className={cn(
				"fixed bottom-0 left-0 right-0 z-40",
				"md:bottom-5 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-auto",
				className,
			)}
		>
			<div
				className={cn(
					"flex items-center bg-background",
					"border-t border-border px-2 py-2",
					"md:gap-1 md:rounded-full md:border md:border-border md:px-1 md:py-1 md:shadow-lg",
				)}
			>
				{isLoading
					? Array.from({ length: items.length || 4 }).map((_, i) => (
							<div
								key={i}
								className="flex flex-1 flex-col items-center gap-1 py-1.5 md:flex-row md:gap-1.5 md:px-4 md:py-2.5 md:flex-initial"
							>
								<Skeleton className="size-5 rounded-md" />
								<Skeleton className="h-2.5 w-8 rounded-sm md:h-3 md:w-10" />
							</div>
						))
					: items.map((item) => {
							const Icon = item.icon;
							const isActive = item.isActive ?? false;

							return (
								<a
									key={item.href}
									href={item.href}
									onClick={(e) => {
										if (onItemClick) {
											e.preventDefault();
											onItemClick(item);
										}
									}}
									className={cn(
										"relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 transition-colors",
										"md:flex-row md:gap-1.5 md:rounded-full md:px-4 md:py-2.5 md:flex-initial",
										isActive
											? "md:bg-foreground md:text-background"
											: "text-muted-foreground hover:text-foreground md:hover:bg-secondary",
									)}
								>
									<Icon
										size={20}
										className={cn(
											"shrink-0 md:size-[18px]",
											isActive
												? "text-foreground md:text-background"
												: "text-muted-foreground",
										)}
									/>
									<span
										className={cn(
											"text-[10px] tracking-wide md:text-xs md:tracking-normal",
											isActive
												? "font-semibold text-foreground md:text-background"
												: "font-normal",
										)}
									>
										{item.label.toUpperCase()}
									</span>

									{item.badge !== undefined && (
										<span
											className={cn(
												"absolute -top-0.5 right-1/4 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground",
												"md:static md:-ml-1 md:size-5 md:text-[10px]",
											)}
										>
											{item.badge}
										</span>
									)}
								</a>
							);
						})}
			</div>
		</nav>
	);
}
