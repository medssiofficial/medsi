"use client";

import { NAV_ITEMS, SIGN_IN_URL } from "@/config/client-constants";
import { useApplicationCountsQuery } from "@/services/api/admin/applications/get-application-counts";
import { useClerk, useUser } from "@clerk/nextjs";
import type { NavItem, ShellUser } from "@repo/ui/components/shells/types";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

const computeInitials = (args: {
	name?: string | null;
	email?: string | null;
}) => {
	const { name, email } = args;

	const value = name?.trim() || email?.trim() || "";
	if (!value) return "A";

	const parts = value
		.split(/\s+/)
		.map((p) => p.trim())
		.filter(Boolean);

	if (parts.length >= 2) {
		return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
	}

	return `${value[0] ?? "A"}`.toUpperCase();
};

const getPageTitleFromPathname = (pathname: string) => {
	if (pathname === "/") return "Dashboard";

	const segment = pathname
		.split("/")
		.filter(Boolean)
		.at(0);

	if (!segment) return "Dashboard";

	return segment
		.split("-")
		.filter(Boolean)
		.map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
		.join(" ");
};

export const useAdminShell = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { signOut } = useClerk();
	const { user, isLoaded } = useUser();
	const applicationCountsQuery = useApplicationCountsQuery();

	const adminUser = useMemo<ShellUser | null>(() => {
		if (!isLoaded) return null;

		const name =
			user?.fullName?.trim() ||
			[user?.firstName, user?.lastName]
				.filter(Boolean)
				.join(" ")
				.trim() ||
			"Admin";
		const email = user?.primaryEmailAddress?.emailAddress ?? undefined;
		const initials = computeInitials({ name, email: email ?? null });

		return {
			name,
			email,
			initials,
			avatarUrl: user?.imageUrl ?? undefined,
		};
	}, [
		isLoaded,
		user?.firstName,
		user?.fullName,
		user?.imageUrl,
		user?.lastName,
		user?.primaryEmailAddress?.emailAddress,
	]);

	const navItems = useMemo<NavItem[]>(() => {
		const current = pathname ?? "/";

		return NAV_ITEMS.map((item) => {
			const isActive =
				item.href === "/"
					? current === "/"
					: current === item.href ||
						current.startsWith(`${item.href}/`);

			return {
				...item,
				isActive,
				badge:
					item.href === "/applications"
						? (applicationCountsQuery.data ?? 0)
						: item.badge,
			};
		});
	}, [applicationCountsQuery.data, pathname]);

	const currentPageTitle = useMemo(() => {
		const activeNavItem = navItems.find((item) => item.isActive);
		if (activeNavItem?.label) return activeNavItem.label;

		return getPageTitleFromPathname(pathname ?? "/");
	}, [navItems, pathname]);

	const handleSignOut = async () => {
		await signOut();
		router.replace(SIGN_IN_URL);
	};

	return {
		navItems,
		user: adminUser,
		isUserLoaded: isLoaded,
		currentPageTitle,
		handleSignOut,
	};
};
