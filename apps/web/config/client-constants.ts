export const SIGN_IN_URL = "/auth/login";
export const SIGN_UP_URL = "/auth/sign-up";
export const DASHBOARD_URL = "/dashboard";
export const ONBOARD_URL = "/onboard";
export const SSO_CALLBACK_URL = "/auth/sso-callback";

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
	},
} as const;
