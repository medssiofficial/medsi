import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { getDoctorFullByClerkId } from "@repo/database/actions/doctor";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../http-error";

export type DoctorMe = NonNullable<
	Awaited<ReturnType<typeof getDoctorFullByClerkId>>
>;

type DoctorMeApiSuccess = JsonApiResponse<{
	doctor: DoctorMe;
}>;

export const getDoctorMe = async (): Promise<DoctorMe> => {
	const response = await fetch(API_ROUTES.DOCTOR.ME.path, {
		method: API_ROUTES.DOCTOR.ME.method,
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

	if (typeof json === "object" && json !== null && "doctor" in json) {
		return (json as { doctor: DoctorMe }).doctor;
	}

	const apiJson = json as DoctorMeApiSuccess;
	if (
		apiJson &&
		typeof apiJson === "object" &&
		"success" in apiJson &&
		apiJson.success === true &&
		apiJson.data &&
		typeof apiJson.data === "object" &&
		"doctor" in apiJson.data
	) {
		return (apiJson.data as { doctor: DoctorMe }).doctor;
	}

	throw new Error("Invalid response.");
};

export const useDoctorMe = (args?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: [API_ROUTES.DOCTOR.ME.key],
		queryFn: getDoctorMe,
		enabled: args?.enabled ?? true,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};
