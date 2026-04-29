import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";

export type PatientListItem = {
	profile_id: string;
	user_id: string;
	name: string;
	email: string;
	account_status: "active";
	join_date: string | Date;
	cases_count: number;
};

export type PatientRegistrySummary = {
	active_patients: number;
	urgent_cases: number;
	pending_reviews: number;
};

type PatientsListResult = {
	patients: PatientListItem[];
	meta: {
		total: number;
		page: number;
		page_size: number;
		total_pages: number;
		has_next_page: boolean;
		has_previous_page: boolean;
	};
	summary: PatientRegistrySummary;
};

type ApiSuccess = JsonApiResponse<PatientsListResult>;

export interface GetAdminPatientsArgs {
	page: number;
	page_size: number;
	search?: string;
}

export const getAdminPatients = async (
	args: GetAdminPatientsArgs,
): Promise<PatientsListResult> => {
	const query = new URLSearchParams({
		page: String(args.page),
		page_size: String(args.page_size),
	});

	if (args.search?.trim()) {
		query.set("search", args.search.trim());
	}

	const response = await fetch(
		`${API_ROUTES.ADMIN.PATIENTS.LIST.path}?${query.toString()}`,
		{
			method: API_ROUTES.ADMIN.PATIENTS.LIST.method,
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
		return apiJson.data as PatientsListResult;
	}

	throw new Error("Invalid response.");
};

export const useAdminPatientsQuery = (args: GetAdminPatientsArgs) => {
	return useQuery({
		queryKey: [
			API_ROUTES.ADMIN.PATIENTS.LIST.key,
			args.page,
			args.page_size,
			args.search ?? "",
		],
		queryFn: () => getAdminPatients(args),
		placeholderData: (previous) => previous,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};

export type { PatientsListResult };
