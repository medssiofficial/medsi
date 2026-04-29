import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { getPatientFullByClerkId } from "@repo/database/actions/patient";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../http-error";

export type PatientMe = NonNullable<
	Awaited<ReturnType<typeof getPatientFullByClerkId>>
>;

type ApiSuccess = JsonApiResponse<{
	patient: PatientMe | null;
	is_onboarding_complete: boolean;
}>;

export const getPatientMe = async (): Promise<{
	patient: PatientMe | null;
	is_onboarding_complete: boolean;
}> => {
	const response = await fetch(API_ROUTES.PATIENT.ME.path, {
		method: API_ROUTES.PATIENT.ME.method,
		headers: {
			"Content-Type": "application/json",
		},
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

	const apiJson = json as ApiSuccess;
	if (
		apiJson &&
		typeof apiJson === "object" &&
		"success" in apiJson &&
		apiJson.success === true &&
		apiJson.data &&
		typeof apiJson.data === "object"
	) {
		return {
			patient: (apiJson.data as { patient: PatientMe | null }).patient,
			is_onboarding_complete: Boolean(
				(apiJson.data as { is_onboarding_complete?: unknown })
					.is_onboarding_complete,
			),
		};
	}

	throw new Error("Invalid response.");
};

export const usePatientMe = (args?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: [API_ROUTES.PATIENT.ME.key],
		queryFn: getPatientMe,
		enabled: args?.enabled ?? true,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};
