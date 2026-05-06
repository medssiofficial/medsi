import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";

export type PatientFolderDetail = {
	patient: {
		user_id: string;
		name: string;
		email: string;
	};
	files: Array<{
		id: string;
		filename: string;
		mime_type: string;
		report_type: "text_report" | "image_report";
		processing_status:
			| "pending"
			| "processing"
			| "completed"
			| "failed"
			| "not_supported";
		created_at: string | Date;
		size_bytes: number | null;
		public_url: string | null;
	}>;
	meta: {
		total: number;
		page: number;
		page_size: number;
		total_pages: number;
		has_next_page: boolean;
		has_previous_page: boolean;
	};
};

type ApiSuccess = JsonApiResponse<PatientFolderDetail>;

export const getPatientFolderDetail = async (
	patientId: string,
	args?: { page?: number; page_size?: number; search?: string },
): Promise<PatientFolderDetail> => {
	const query = new URLSearchParams({
		page: String(args?.page ?? 1),
		page_size: String(args?.page_size ?? 12),
	});
	if (args?.search?.trim()) query.set("search", args.search.trim());

	const response = await fetch(
		`${API_ROUTES.ADMIN.FILES.PATIENTS.DETAIL.path}/${patientId}?${query.toString()}`,
		{
			method: API_ROUTES.ADMIN.FILES.PATIENTS.DETAIL.method,
			headers: { "Content-Type": "application/json" },
		},
	);

	const json = (await response.json()) as unknown;
	if (!response.ok) {
		throw new HttpError({
			status: response.status,
			message:
				typeof json === "object" &&
				json !== null &&
				"error" in json &&
				typeof (json as { error?: unknown }).error === "string"
					? (json as { error: string }).error
					: response.statusText,
		});
	}

	const apiJson = json as ApiSuccess;
	if (apiJson.success && apiJson.data) return apiJson.data;
	throw new Error("Invalid response.");
};

export const usePatientFolderDetailQuery = (
	patientId: string,
	args?: { page?: number; page_size?: number; search?: string },
) =>
	useQuery({
		queryKey: [
			API_ROUTES.ADMIN.FILES.PATIENTS.DETAIL.key,
			patientId,
			args?.page ?? 1,
			args?.page_size ?? 12,
			args?.search ?? "",
		],
		queryFn: () => getPatientFolderDetail(patientId, args),
		enabled: Boolean(patientId),
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 0,
		// Keep admin folder synced with background task transitions.
		refetchInterval: 4000,
	});
