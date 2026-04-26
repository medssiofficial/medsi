"use client";

import {
	ACCEPTED_CASES_URL,
	DASHBOARD_URL,
	INBOX_URL,
	MY_PROFILE_URL,
	SETTINGS_URL,
	SIGN_IN_URL,
} from "@/config/client-constants";
import { useDoctorStore } from "@/store/doctor.store";
import { useClerk, useUser } from "@clerk/nextjs";
import type { NavItem, ShellUser } from "@repo/ui/components/shells/types";
import {
	Bell,
	BriefcaseMedical,
	LayoutDashboard,
	Settings,
	UserRound,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

const computeInitials = (args: {
	name?: string | null;
	email?: string | null;
}) => {
	const value = args.name?.trim() || args.email?.trim() || "";
	if (!value) return "D";

	const parts = value
		.split(/\s+/)
		.map((part) => part.trim())
		.filter(Boolean);

	if (parts.length >= 2) {
		return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
	}

	return `${value[0] ?? "D"}`.toUpperCase();
};

const NAV_ITEMS: Omit<NavItem, "isActive">[] = [
	{ label: "Dashboard", href: DASHBOARD_URL, icon: LayoutDashboard },
	{ label: "Inbox", href: INBOX_URL, icon: Bell },
	{
		label: "Accepted Cases",
		href: ACCEPTED_CASES_URL,
		icon: BriefcaseMedical,
	},
	{ label: "My Profile", href: MY_PROFILE_URL, icon: UserRound },
	{ label: "Settings", href: SETTINGS_URL, icon: Settings },
];

export const useDoctorSidebar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { signOut } = useClerk();
	const { user } = useUser();
	const doctor = useDoctorStore((state) => state.doctor);

	const navItems = useMemo<NavItem[]>(() => {
		const current = pathname ?? "/";
		return NAV_ITEMS.map((item) => {
			const isActive =
				item.href === "/"
					? current === "/"
					: current === item.href || current.startsWith(`${item.href}/`);
			return { ...item, isActive };
		});
	}, [pathname]);

	const shellUser = useMemo<ShellUser>(() => {
		const name = doctor?.profile?.name?.trim() || user?.fullName?.trim() || "Doctor";
		const email =
			doctor?.profile?.email ?? user?.primaryEmailAddress?.emailAddress ?? undefined;

		return {
			name,
			email,
			initials: computeInitials({ name, email }),
			avatarUrl: user?.imageUrl ?? undefined,
		};
	}, [doctor?.profile?.email, doctor?.profile?.name, user?.fullName, user?.imageUrl, user?.primaryEmailAddress?.emailAddress]);

	const onSignOut = async () => {
		await signOut();
		router.replace(SIGN_IN_URL);
	};

	return {
		navItems,
		shellUser,
		onSignOut,
	};
};

