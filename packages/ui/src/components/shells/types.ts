import type { LucideIcon } from "lucide-react";

/* ── Navigation ── */

export interface NavItem {
	label: string;
	href: string;
	icon: LucideIcon;
	action?: string;
	badge?: number | string;
	isActive?: boolean;
	children?: NavItem[];
}

export interface SidebarConfig {
	items: NavItem[];
	footer?: NavItem[];
}

/* ── Breadcrumbs ── */

export interface BreadcrumbEntry {
	label: string;
	href?: string;
}

/* ── Top bar ── */

export interface TopBarConfig {
	breadcrumbs?: BreadcrumbEntry[];
	showSearch?: boolean;
	searchPlaceholder?: string;
	showNotifications?: boolean;
	notificationCount?: number;
}

/* ── User ── */

export interface ShellUser {
	name: string;
	initials: string;
	email?: string;
	avatarUrl?: string;
}

/* ── Bottom nav (patient) ── */

export interface BottomNavItem {
	label: string;
	href: string;
	icon: LucideIcon;
	isActive?: boolean;
	badge?: number | string;
}

/* ── Loading states ── */

export interface ShellLoadingState {
	isLoading: boolean;
	loadingText?: string;
}

/* ── Desktop shell ── */

export interface DesktopShellProps {
	sidebarVariant?: "dark" | "light";
	logo: React.ReactNode;
	sidebarConfig: SidebarConfig;
	topBarConfig?: TopBarConfig;
	user?: ShellUser | null;
	isLoading?: boolean;
	loadingText?: string;
	onSearch?: (query: string) => void;
	onNotificationClick?: () => void;
	onSignOut?: () => void;
	onNavItemClick?: (item: NavItem) => void;
	onFooterItemClick?: (item: NavItem) => void;
	onUserMenuClick?: () => void;
	className?: string;
	children: React.ReactNode;
}

/* ── Patient shell ── */

export interface PatientShellProps {
	user?: ShellUser | null;
	navItems: BottomNavItem[];
	notificationCount?: number;
	isLoading?: boolean;
	loadingText?: string;
	onNotificationClick?: () => void;
	onAvatarClick?: () => void;
	onNavItemClick?: (item: BottomNavItem) => void;
	className?: string;
	children: React.ReactNode;
}

/* ── Desktop-only gate ── */

export interface DesktopOnlyGateProps {
	appName?: string;
	children: React.ReactNode;
}
