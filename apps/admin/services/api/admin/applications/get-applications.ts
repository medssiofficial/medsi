import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";
import type { AdminApplicationsListResult } from "./types";

type ApiSuccess = JsonApiResponse<{
	applications: AdminApplicationsListResult["items"];
	meta: AdminApplicationsListResult["meta"];
}>;

export type AdminApplicationStatusFilter =
	| "all"
	| "pending"
	| "under_review"
	| "approved"
	| "rejected";

export interface GetAdminApplicationsArgs {
	page: number;
	page_size: number;
	search?: string;
	status?: AdminApplicationStatusFilter;
}

export const getAdminApplications = async (
	args: GetAdminApplicationsArgs,
): Promise<{
	applications: AdminApplicationsListResult["items"];
	meta: AdminApplicationsListResult["meta"];
}> => {
	const query = new URLSearchParams({
		page: String(args.page),
		page_size: String(args.page_size),
		status: args.status ?? "all",
	});

	if (args.search?.trim()) {
		query.set("search", args.search.trim());
	}

	const response = await fetch(
		`${API_ROUTES.ADMIN.APPLICATIONS.LIST.path}?${query.toString()}`,
		{
			method: API_ROUTES.ADMIN.APPLICATIONS.LIST.method,
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
		typeof apiJson.data === "object"
	) {
		return {
			applications:
				(apiJson.data as { applications: AdminApplicationsListResult["items"] })
					.applications ?? [],
			meta: (apiJson.data as { meta: AdminApplicationsListResult["meta"] }).meta,
		};
	}

	throw new Error("Invalid response.");
};

export const useAdminApplicationsQuery = (args: GetAdminApplicationsArgs) => {
	return useQuery({
		queryKey: [
			API_ROUTES.ADMIN.APPLICATIONS.LIST.key,
			args.page,
			args.page_size,
			args.search ?? "",
			args.status ?? "all",
		],
		queryFn: () => getAdminApplications(args),
		placeholderData: (previous) => previous,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};
