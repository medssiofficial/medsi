import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "../http-error";

export type PatientOnboardingProfileInput = {
	name: string;
	age: number;
	gender: "male" | "female" | "other";
	email: string;
	phone: string;
	country: string;
};

export type UpsertOnboardingProfileResult = {
	is_onboarding_complete: boolean;
};

export const upsertPatientOnboardingProfile = async (
	body: PatientOnboardingProfileInput,
): Promise<UpsertOnboardingProfileResult> => {
	const response = await fetch(API_ROUTES.PATIENT.ONBOARDING.PROFILE.path, {
		method: API_ROUTES.PATIENT.ONBOARDING.PROFILE.method,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	let json: unknown = null;
	try {
		json = (await response.json()) as unknown;
	} catch {
		json = null;
	}

	if (!response.ok) {
		let message = response.statusText;
		if (typeof json === "object" && json !== null) {
			if (
				"error" in json &&
				typeof (json as { error?: unknown }).error === "string"
			) {
				message = (json as { error: string }).error;
			} else if (
				"message" in json &&
				typeof (json as { message?: unknown }).message === "string"
			) {
				message = (json as { message: string }).message;
			}
		}

		throw new HttpError({ status: response.status, message });
	}

	if (
		typeof json === "object" &&
		json !== null &&
		"data" in json &&
		typeof (json as { data?: unknown }).data === "object" &&
		(json as { data: { is_onboarding_complete?: unknown } }).data
	) {
		return {
			is_onboarding_complete: Boolean(
				(json as { data: { is_onboarding_complete?: unknown } }).data
					.is_onboarding_complete,
			),
		};
	}

	throw new Error("Invalid response.");
};

export const useUpsertPatientOnboardingProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.PATIENT.ONBOARDING.PROFILE.key],
		mutationFn: upsertPatientOnboardingProfile,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.ME.key],
			});
		},
	});
};
