import type { NavItem } from "@repo/ui/components/shells/types";
import {
	Calendar,
	FileText,
	LayoutDashboard,
	Settings,
	User,
	Users,
} from "lucide-react";

export const SIGN_IN_URL = "/auth/sign-in";
export const ACCESS_DENIED_URL = "/auth/access-denied";
export const DASHBOARD_URL = "/";

export const NAV_ITEMS: NavItem[] = [
	{ label: "Dashboard", href: "/", icon: LayoutDashboard },
	{ label: "Doctors", href: "/doctors", icon: Users },
	{ label: "Patients", href: "/patients", icon: User },
	{ label: "Appointments", href: "/appointments", icon: Calendar },
	{ label: "Applications", href: "/applications", icon: FileText },
	{ label: "Settings", href: "/settings", icon: Settings },
];
