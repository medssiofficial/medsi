import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";

type ApiSuccess = JsonApiResponse<{
	pending_or_under_review_count: number;
}>;

export const getApplicationCounts = async (): Promise<number> => {
	const response = await fetch(API_ROUTES.ADMIN.APPLICATIONS.COUNTS.path, {
		method: API_ROUTES.ADMIN.APPLICATIONS.COUNTS.method,
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
		typeof apiJson.data === "object" &&
		"pending_or_under_review_count" in apiJson.data
	) {
		return (apiJson.data as { pending_or_under_review_count: number })
			.pending_or_under_review_count;
	}

	throw new Error("Invalid response.");
};

export const useApplicationCountsQuery = () => {
	return useQuery({
		queryKey: [API_ROUTES.ADMIN.APPLICATIONS.COUNTS.key],
		queryFn: getApplicationCounts,
	});
};
