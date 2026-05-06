import type { NavItem } from "@repo/ui/components/shells/types";
import {
	BriefcaseMedical,
	FileText,
	Folder,
	GitMerge,
	LayoutDashboard,
	MessageSquareText,
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
			EMBED: {
				key: "admin.doctors.embed",
				path: "/api/admin/doctors",
				method: "POST",
			},
			EMBED_BULK: {
				key: "admin.doctors.embed-bulk",
				path: "/api/admin/doctors/embed-bulk",
				method: "POST",
			},
		},
		EMBEDDING_LOGS: {
			LIST: {
				key: "admin.embedding-logs.list",
				path: "/api/admin/embedding-logs",
				method: "GET",
			},
		},
		PATIENT_FILE_PROCESSING_LOGS: {
			LIST: {
				key: "admin.patient-file-processing-logs.list",
				path: "/api/admin/patient-file-processing-logs",
				method: "GET",
			},
		},
		PATIENTS: {
			LIST: {
				key: "admin.patients.list",
				path: "/api/admin/patients",
				method: "GET",
			},
		},
		MEDICAL_CASES: {
			LIST: {
				key: "admin.medical-cases.list",
				path: "/api/admin/medical-cases",
				method: "GET",
			},
			DETAIL: {
				key: "admin.medical-cases.detail",
				path: "/api/admin/medical-cases",
				method: "GET",
			},
		},
		INTAKE_QUESTIONS: {
			LIST: {
				key: "admin.intake-questions.list",
				path: "/api/admin/intake-questions",
				method: "GET",
			},
			CREATE: {
				key: "admin.intake-questions.create",
				path: "/api/admin/intake-questions",
				method: "POST",
			},
			UPDATE: {
				key: "admin.intake-questions.update",
				path: "/api/admin/intake-questions",
				method: "PUT",
			},
			DELETE: {
				key: "admin.intake-questions.delete",
				path: "/api/admin/intake-questions",
				method: "DELETE",
			},
			REORDER: {
				key: "admin.intake-questions.reorder",
				path: "/api/admin/intake-questions/reorder",
				method: "PATCH",
			},
		},
		FILES: {
			DOCTORS: {
				LIST: {
					key: "admin.files.doctors.list",
					path: "/api/admin/files/doctors",
					method: "GET",
				},
				DETAIL: {
					key: "admin.files.doctors.detail",
					path: "/api/admin/files/doctors",
					method: "GET",
				},
			},
			PATIENTS: {
				LIST: {
					key: "admin.files.patients.list",
					path: "/api/admin/files/patients",
					method: "GET",
				},
				DETAIL: {
					key: "admin.files.patients.detail",
					path: "/api/admin/files/patients",
					method: "GET",
				},
			},
		},
	},
} as const;

export const NAV_ITEMS: NavItem[] = [
	{ label: "Dashboard", href: "/", icon: LayoutDashboard },
	{ label: "Doctor Applications", href: "/applications", icon: FileText },
	{ label: "Doctors", href: "/doctors", icon: Users },
	{ label: "Patients", href: "/patients", icon: User },
	{ label: "Intake Questions", href: "/intake-questions", icon: MessageSquareText },
	{ label: "Medical Cases", href: "/medical-cases", icon: BriefcaseMedical },
	{ label: "Matches", href: "/matches", icon: GitMerge },
	{ label: "Files", href: "/files", icon: Folder },
	{ label: "Appointments", href: "/appointments", icon: Stethoscope },
	{ label: "Settings", href: "/settings", icon: Settings },
];
