import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";

import { HttpError } from "../../http-error";

export type EmbeddingLogItem = {
	id: string;
	doctor_id: string;
	source: string;
	outcome: string;
	error_message: string | null;
	embedding_model: string | null;
	dimensions: number | null;
	trigger_run_id: string | null;
	created_at: string | Date;
	doctor: {
		id: string;
		profile: { name: string; email: string } | null;
	};
};

type ListResult = {
	items: EmbeddingLogItem[];
	meta: {
		total: number;
		page: number;
		page_size: number;
		total_pages: number;
		has_next_page: boolean;
		has_previous_page: boolean;
	};
};

type ApiSuccess = JsonApiResponse<ListResult>;

export const getAdminEmbeddingLogs = async (args: {
	page: number;
	page_size: number;
}): Promise<ListResult> => {
	const query = new URLSearchParams({
		page: String(args.page),
		page_size: String(args.page_size),
	});

	const response = await fetch(
		`${API_ROUTES.ADMIN.EMBEDDING_LOGS.LIST.path}?${query.toString()}`,
		{
			method: API_ROUTES.ADMIN.EMBEDDING_LOGS.LIST.method,
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
		"items" in apiJson.data
	) {
		return apiJson.data as ListResult;
	}

	throw new Error("Invalid response.");
};

export const useAdminEmbeddingLogsQuery = (args: {
	page: number;
	page_size: number;
}) => {
	return useQuery({
		queryKey: [
			API_ROUTES.ADMIN.EMBEDDING_LOGS.LIST.key,
			args.page,
			args.page_size,
		],
		queryFn: () => getAdminEmbeddingLogs(args),
		placeholderData: (previous) => previous,
		refetchOnWindowFocus: false,
		staleTime: 30 * 1000,
	});
};
