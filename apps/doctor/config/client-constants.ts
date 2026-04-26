export const SIGN_IN_URL = "/auth/login";
export const SIGN_UP_URL = "/auth/sign-up";
export const DASHBOARD_URL = "/";
export const INBOX_URL = "/inbox";
export const ACCEPTED_CASES_URL = "/accepted-cases";
export const MY_PROFILE_URL = "/my-profile";
export const SETTINGS_URL = "/settings";
export const ONBOARD_URL = "/onboard";
export const ONBOARD_UNDER_REVIEW_URL = "/onboard/under-review";

export const DOCTOR_APP_ROUTES = [
	DASHBOARD_URL,
	INBOX_URL,
	ACCEPTED_CASES_URL,
	MY_PROFILE_URL,
	SETTINGS_URL,
] as const;

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
			UPLOAD_PROOF: {
				key: "doctor.onboarding.upload-proof",
				path: "/api/doctor/onboarding/proofs/upload",
				method: "POST",
			},
			REVIEW_STATUS: {
				key: "doctor.onboarding.review-status",
				path: "/api/doctor/onboarding/review-status",
				method: "GET",
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
