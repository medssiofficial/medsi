export const SIGN_IN_URL = "/auth/login";
export const SIGN_UP_URL = "/auth/sign-up";
export const DASHBOARD_URL = "/";
export const ONBOARD_URL = "/onboard";

export const API_ROUTES = {
	DOCTOR: {
		ME: {
			key: "doctor.me",
			path: "/api/doctor/me",
			method: "GET",
		},
		ONBOARDING: {
			PROFILE: {
				key: "doctor.onboarding.profile",
				path: "/api/doctor/onboarding/profile",
				method: "PUT",
			},
			PROFILE_METADATA: {
				key: "doctor.onboarding.profile-metadata",
				path: "/api/doctor/onboarding/profile-metadata",
				method: "PUT",
			},
			EXPERTISES: {
				key: "doctor.onboarding.expertises",
				path: "/api/doctor/onboarding/expertises",
				method: "PUT",
			},
			SPECIALIZATIONS: {
				key: "doctor.onboarding.specializations",
				path: "/api/doctor/onboarding/specializations",
				method: "PUT",
			},
			SUBMIT: {
				key: "doctor.onboarding.submit",
				path: "/api/doctor/onboarding/submit",
				method: "POST",
			},
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
