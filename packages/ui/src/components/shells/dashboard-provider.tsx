"use client";

import {
	createContext,
	useContext,
	useMemo,
	type ReactNode,
} from "react";
import type {
	ShellUser,
	SidebarConfig,
	TopBarConfig,
	ShellLoadingState,
} from "./types";

interface DashboardContextValue {
	user: ShellUser | null;
	sidebarConfig: SidebarConfig;
	topBarConfig: TopBarConfig;
	loading: ShellLoadingState;
	onSearch?: (query: string) => void;
	onNotificationClick?: () => void;
	onSignOut?: () => void;
	onUserMenuClick?: () => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
	const ctx = useContext(DashboardContext);
	if (!ctx) {
		throw new Error("useDashboard must be used within a DashboardProvider.");
	}
	return ctx;
}

interface DashboardProviderProps {
	user: ShellUser | null;
	sidebarConfig: SidebarConfig;
	topBarConfig?: TopBarConfig;
	isLoading?: boolean;
	loadingText?: string;
	onSearch?: (query: string) => void;
	onNotificationClick?: () => void;
	onSignOut?: () => void;
	onUserMenuClick?: () => void;
	children: ReactNode;
}

export function DashboardProvider({
	user,
	sidebarConfig,
	topBarConfig = {},
	isLoading = false,
	loadingText,
	onSearch,
	onNotificationClick,
	onSignOut,
	onUserMenuClick,
	children,
}: DashboardProviderProps) {
	const value = useMemo<DashboardContextValue>(
		() => ({
			user,
			sidebarConfig,
			topBarConfig,
			loading: { isLoading, loadingText },
			onSearch,
			onNotificationClick,
			onSignOut,
			onUserMenuClick,
		}),
		[
			user,
			sidebarConfig,
			topBarConfig,
			isLoading,
			loadingText,
			onSearch,
			onNotificationClick,
			onSignOut,
			onUserMenuClick,
		],
	);

	return (
		<DashboardContext.Provider value={value}>
			{children}
		</DashboardContext.Provider>
	);
}
