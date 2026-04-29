export const SIGN_IN_URL = "/auth/login";
export const SIGN_UP_URL = "/auth/sign-up";
export const DASHBOARD_URL = "/dashboard";
export const ONBOARD_URL = "/onboard";
export const SSO_CALLBACK_URL = "/auth/sso-callback";

export const PUBLIC_ROUTES = [
	"/",
	SIGN_IN_URL,
	SIGN_UP_URL,
	`${SSO_CALLBACK_URL}(.*)`,
	"/api/health",
] as const;
