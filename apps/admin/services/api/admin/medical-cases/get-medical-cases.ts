import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";

export type MedicalCaseListItem = {
	id: string;
	user_id: string;
	conversation_status: string;
	case_stage: string;
	language: string;
	summary: string | null;
	created_at: string | Date;
	updated_at: string | Date;
	user: {
		profile: {
			name: string | null;
			email: string | null;
		} | null;
	};
	_count: {
		files: number;
		chat_messages: number;
		event_logs: number;
	};
};

export type MedicalCasesListResult = {
	cases: MedicalCaseListItem[];
	meta: {
		total: number;
		page: number;
		page_size: number;
		total_pages: number;
		has_next_page: boolean;
		has_previous_page: boolean;
	};
};

type ApiSuccess = JsonApiResponse<MedicalCasesListResult>;

export interface GetMedicalCasesArgs {
	page: number;
	page_size: number;
	search?: string;
	stage?: string;
	status?: string;
}

export const getMedicalCases = async (
	args: GetMedicalCasesArgs,
): Promise<MedicalCasesListResult> => {
	const query = new URLSearchParams({
		page: String(args.page),
		page_size: String(args.page_size),
	});

	if (args.search?.trim()) {
		query.set("search", args.search.trim());
	}

	if (args.stage?.trim()) {
		query.set("stage", args.stage.trim());
	}

	if (args.status?.trim()) {
		query.set("status", args.status.trim());
	}

	const response = await fetch(
		`${API_ROUTES.ADMIN.MEDICAL_CASES.LIST.path}?${query.toString()}`,
		{
			method: API_ROUTES.ADMIN.MEDICAL_CASES.LIST.method,
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
		return apiJson.data as MedicalCasesListResult;
	}

	throw new Error("Invalid response.");
};

export const useMedicalCasesQuery = (args: GetMedicalCasesArgs) => {
	return useQuery({
		queryKey: [
			API_ROUTES.ADMIN.MEDICAL_CASES.LIST.key,
			args.page,
			args.page_size,
			args.search ?? "",
			args.stage ?? "",
			args.status ?? "",
		],
		queryFn: () => getMedicalCases(args),
		placeholderData: (previous) => previous,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};
