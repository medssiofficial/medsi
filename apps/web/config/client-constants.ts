export const SIGN_IN_URL = "/auth/login";
export const SIGN_UP_URL = "/auth/sign-up";
export const DASHBOARD_URL = "/home";

export const API_ROUTES = {
	PATIENT: {
		ME: {
			key: "patient.me",
			path: "/api/patient/me",
			method: "GET",
		},
	},
} as const;
