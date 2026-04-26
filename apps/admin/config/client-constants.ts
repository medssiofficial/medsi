import type { NavItem } from "@repo/ui/components/shells/types";
import {
	BriefcaseMedical,
	FileText,
	Folder,
	GitMerge,
	LayoutDashboard,
	Settings,
	Stethoscope,
	User,
	Users,
} from "lucide-react";

export const SIGN_IN_URL = "/auth/sign-in";
export const ACCESS_DENIED_URL = "/auth/access-denied";
export const DASHBOARD_URL = "/";

export const API_ROUTES = {
	ADMIN: {
		ME: {
			key: "admin.me",
			path: "/api/admin/me",
			method: "GET",
		},
		APPLICATIONS: {
			LIST: {
				key: "admin.applications.list",
				path: "/api/admin/applications",
				method: "GET",
			},
			COUNTS: {
				key: "admin.applications.counts",
				path: "/api/admin/applications/counts",
				method: "GET",
			},
			DETAIL: {
				key: "admin.applications.detail",
				path: "/api/admin/applications",
				method: "GET",
			},
			REVIEW: {
				key: "admin.applications.review",
				path: "/api/admin/applications",
				method: "PATCH",
			},
		},
		DOCTORS: {
			LIST: {
				key: "admin.doctors.list",
				path: "/api/admin/doctors",
				method: "GET",
			},
			DETAIL: {
				key: "admin.doctors.detail",
				path: "/api/admin/doctors",
				method: "GET",
			},
		},
	},
} as const;

export const NAV_ITEMS: NavItem[] = [
	{ label: "Dashboard", href: "/", icon: LayoutDashboard },
	{ label: "Doctor Applications", href: "/applications", icon: FileText },
	{ label: "Doctors", href: "/doctors", icon: Users },
	{ label: "Patients", href: "/patients", icon: User },
	{ label: "Medical Cases", href: "/medical-cases", icon: BriefcaseMedical },
	{ label: "Matches", href: "/matches", icon: GitMerge },
	{ label: "Files", href: "/files", icon: Folder },
	{ label: "Appointments", href: "/appointments", icon: Stethoscope },
	{ label: "Settings", href: "/settings", icon: Settings },
];
