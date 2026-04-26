import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";

type DoctorListItem = {
	id: string;
	clerk_id: string;
	verified: boolean;
	created_at: string | Date;
	profile: {
		name: string | null;
		email: string | null;
		country: string | null;
		city: string | null;
		years_in_practice: number | null;
		type_of_doctor: string | null;
	} | null;
	specializations: Array<{ name: string }>;
	application: {
		status: string;
		created_at: string | Date;
	} | null;
};

type DoctorsListResult = {
	doctors: DoctorListItem[];
	meta: {
		total: number;
		page: number;
		page_size: number;
		total_pages: number;
		has_next_page: boolean;
		has_previous_page: boolean;
	};
};

type ApiSuccess = JsonApiResponse<DoctorsListResult>;

export type AdminDoctorsVerifiedFilter = "all" | "verified" | "unverified";

export interface GetAdminDoctorsArgs {
	page: number;
	page_size: number;
	search?: string;
	verified?: AdminDoctorsVerifiedFilter;
}

export const getAdminDoctors = async (
	args: GetAdminDoctorsArgs,
): Promise<DoctorsListResult> => {
	const query = new URLSearchParams({
		page: String(args.page),
		page_size: String(args.page_size),
		verified: args.verified ?? "all",
	});

	if (args.search?.trim()) {
		query.set("search", args.search.trim());
	}

	const response = await fetch(
		`${API_ROUTES.ADMIN.DOCTORS.LIST.path}?${query.toString()}`,
		{
			method: API_ROUTES.ADMIN.DOCTORS.LIST.method,
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
		return apiJson.data as DoctorsListResult;
	}

	throw new Error("Invalid response.");
};

export const useAdminDoctorsQuery = (args: GetAdminDoctorsArgs) => {
	return useQuery({
		queryKey: [
			API_ROUTES.ADMIN.DOCTORS.LIST.key,
			args.page,
			args.page_size,
			args.search ?? "",
			args.verified ?? "all",
		],
		queryFn: () => getAdminDoctors(args),
		placeholderData: (previous) => previous,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};

export type { DoctorListItem, DoctorsListResult };
