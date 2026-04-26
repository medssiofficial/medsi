import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";
import type { AdminApplicationDetail } from "./types";

type ApiSuccess = JsonApiResponse<{
	application: AdminApplicationDetail;
}>;

export const getAdminApplicationDetail = async (args: {
	application_id: string;
}): Promise<AdminApplicationDetail> => {
	const response = await fetch(
		`${API_ROUTES.ADMIN.APPLICATIONS.DETAIL.path}/${args.application_id}`,
		{
			method: API_ROUTES.ADMIN.APPLICATIONS.DETAIL.method,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

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
		"application" in apiJson.data
	) {
		return (apiJson.data as { application: AdminApplicationDetail }).application;
	}

	throw new Error("Invalid response.");
};

export const useAdminApplicationDetailQuery = (args: {
	application_id: string | null;
	enabled?: boolean;
}) => {
	return useQuery({
		queryKey: [API_ROUTES.ADMIN.APPLICATIONS.DETAIL.key, args.application_id],
		queryFn: () =>
			getAdminApplicationDetail({
				application_id: args.application_id ?? "",
			}),
		enabled: Boolean(args.application_id) && (args.enabled ?? true),
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};
