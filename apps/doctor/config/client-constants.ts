export const SIGN_IN_URL = "/auth/login";
export const SIGN_UP_URL = "/auth/sign-up";
export const DASHBOARD_URL = "/dashboard";
export const ONBOARD_URL = "/onboard";

export const API_ROUTES = {
	DOCTOR: {
		ME: {
			key: "doctor.me",
			path: "/api/doctor/me",
			method: "GET",
		},
	},
} as const;

export const SIGN_UP_HERO_POINTERS = [
	"Reach patients across borders",
	"AI-powered case matching",
	"Secure HIPAA compliant platform",
	"Flexible schedule work from anywhere",
	"Transparent earnings and payouts",
];
