export const SIGN_IN_URL = "/auth/login";
export const SIGN_UP_URL = "/auth/sign-up";
export const DASHBOARD_URL = "/dashboard";
export const ONBOARD_URL = "/onboard";
export const SSO_CALLBACK_URL = "/auth/sso-callback";
export const PROFILE_URL = "/profile";
export const SETTINGS_URL = "/settings";
export const CASES_URL = "/cases";
export const FILES_URL = "/files";
export const CHAT_URL = "/chat";

export const APP_TAB_ROUTES = [
	DASHBOARD_URL,
	CASES_URL,
	FILES_URL,
	CHAT_URL,
	PROFILE_URL,
] as const;

export const API_ROUTES = {
	PATIENT: {
		ME: {
			key: "patient.me",
			path: "/api/patient/me",
			method: "GET",
		},
		ONBOARDING: {
			PROFILE: {
				key: "patient.onboarding.profile",
				path: "/api/patient/onboarding/profile",
				method: "PUT",
			},
		},
		PROFILE: {
			key: "patient.profile",
			path: "/api/patient/profile",
			method: "GET",
		},
		PROFILE_UPDATE: {
			key: "patient.profile.update",
			path: "/api/patient/profile",
			method: "PUT",
		},
		SETTINGS: {
			key: "patient.settings",
			path: "/api/patient/settings",
			method: "GET",
		},
		SETTINGS_UPDATE: {
			key: "patient.settings.update",
			path: "/api/patient/settings",
			method: "PUT",
		},
	},
} as const;
