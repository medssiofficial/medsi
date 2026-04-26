import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../http-error";

type DoctorInboxCountApiSuccess = JsonApiResponse<{
	count: number;
}>;

export const getDoctorInboxCount = async (): Promise<number> => {
	const response = await fetch(API_ROUTES.DOCTOR.INBOX_COUNT.path, {
		method: API_ROUTES.DOCTOR.INBOX_COUNT.method,
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

	const apiJson = json as DoctorInboxCountApiSuccess;
	if (
		apiJson &&
		typeof apiJson === "object" &&
		"success" in apiJson &&
		apiJson.success === true &&
		apiJson.data &&
		typeof apiJson.data === "object" &&
		"count" in apiJson.data &&
		typeof (apiJson.data as { count: unknown }).count === "number"
	) {
		return (apiJson.data as { count: number }).count;
	}

	throw new Error("Invalid response.");
};

export const useDoctorInboxCount = (args?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: [API_ROUTES.DOCTOR.INBOX_COUNT.key],
		queryFn: getDoctorInboxCount,
		enabled: args?.enabled ?? true,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};

