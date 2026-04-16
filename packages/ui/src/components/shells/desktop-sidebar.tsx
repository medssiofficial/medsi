"use client";

import { cn } from "../../lib/utils";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
} from "../ui/sidebar";
import type { SidebarConfig, NavItem } from "./types";

interface DesktopSidebarProps {
	variant?: "dark" | "light";
	logo: React.ReactNode;
	config: SidebarConfig;
	isLoading?: boolean;
	onNavItemClick?: (item: NavItem) => void;
	onFooterItemClick?: (item: NavItem) => void;
	className?: string;
}

function NavItemRow({
	item,
	variant,
	onClick,
}: {
	item: NavItem;
	variant: "dark" | "light";
	onClick?: (item: NavItem) => void;
}) {
	const isActive = item.isActive ?? false;

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={isActive}
				tooltip={item.label}
				className={cn(
					"h-10 gap-2.5 rounded-md px-3 font-sans text-sm",
					variant === "dark" && [
						"text-grey-300 hover:bg-grey-600 hover:text-white",
						isActive && "bg-grey-600 text-white font-medium",
					],
					variant === "light" && [
						"text-grey-500 hover:bg-secondary hover:text-foreground",
						isActive &&
							"bg-secondary text-foreground font-medium",
					],
				)}
			>
				<a href={item.href} onClick={() => onClick?.(item)}>
					<item.icon size={18} />
					<span>{item.label}</span>
				</a>
			</SidebarMenuButton>
			{item.badge !== undefined && (
				<SidebarMenuBadge
					className={cn(
						"rounded-full px-1.5 text-[11px] font-semibold min-w-[22px] h-5 flex items-center justify-center",
						variant === "dark"
							? "bg-white text-foreground"
							: "bg-foreground text-white",
					)}
				>
					{item.badge}
				</SidebarMenuBadge>
			)}
		</SidebarMenuItem>
	);
}

export function DesktopSidebar({
	variant = "dark",
	logo,
	config,
	isLoading = false,
	onNavItemClick,
	onFooterItemClick,
	className,
}: DesktopSidebarProps) {
	return (
		<Sidebar
			collapsible="icon"
			className={cn(
				variant === "dark" && "sidebar-dark",
				variant === "light" && "sidebar-light",
				className,
			)}
		>
			{/* Logo */}
			<SidebarHeader
				className={cn(
					"px-4 pb-5 pt-6",
					variant === "dark"
						? "text-white"
						: "text-foreground",
				)}
			>
				{logo}
			</SidebarHeader>

			{/* Nav items */}
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{isLoading
								? Array.from({ length: 6 }).map((_, i) => (
										<SidebarMenuItem key={i}>
											<SidebarMenuSkeleton showIcon />
										</SidebarMenuItem>
									))
								: config.items.map((item) => (
										<NavItemRow
											key={item.href}
											item={item}
											variant={variant}
											onClick={onNavItemClick}
										/>
									))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			{/* Footer (Sign Out, etc.) */}
			{config.footer && config.footer.length > 0 && (
				<SidebarFooter className="px-2 pb-4">
					<SidebarMenu>
						{config.footer.map((item) => (
							<NavItemRow
								key={item.href}
								item={item}
								variant={variant}
								onClick={onFooterItemClick}
							/>
						))}
					</SidebarMenu>
				</SidebarFooter>
			)}
		</Sidebar>
	);
}
