import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";

export type DoctorFolderDetail = {
	doctor: {
		id: string;
		name: string;
		email: string;
	};
	files: Array<{
		id: string;
		filename: string;
		mime_type: string;
		proof_type: string;
		public_url: string;
		size_bytes: number | null;
		created_at: string | Date;
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

type ApiSuccess = JsonApiResponse<DoctorFolderDetail>;

export const getDoctorFolderDetail = async (
	doctorId: string,
	args?: { page?: number; page_size?: number; search?: string },
): Promise<DoctorFolderDetail> => {
	const query = new URLSearchParams({
		page: String(args?.page ?? 1),
		page_size: String(args?.page_size ?? 12),
	});
	if (args?.search?.trim()) query.set("search", args.search.trim());

	const response = await fetch(
		`${API_ROUTES.ADMIN.FILES.DOCTORS.DETAIL.path}/${doctorId}?${query.toString()}`,
		{
			method: API_ROUTES.ADMIN.FILES.DOCTORS.DETAIL.method,
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

export const useDoctorFolderDetailQuery = (
	doctorId: string,
	args?: { page?: number; page_size?: number; search?: string },
) =>
	useQuery({
		queryKey: [
			API_ROUTES.ADMIN.FILES.DOCTORS.DETAIL.key,
			doctorId,
			args?.page ?? 1,
			args?.page_size ?? 12,
			args?.search ?? "",
		],
		queryFn: () => getDoctorFolderDetail(doctorId, args),
		enabled: Boolean(doctorId),
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
