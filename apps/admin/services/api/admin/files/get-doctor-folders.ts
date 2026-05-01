import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";

type DoctorFolderItem = {
	doctor_id: string;
	name: string;
	email: string;
	file_count: number;
	last_file_at: string | Date | null;
};

type DoctorFoldersResult = {
	doctors: DoctorFolderItem[];
	meta: {
		total: number;
		page: number;
		page_size: number;
		total_pages: number;
		has_next_page: boolean;
		has_previous_page: boolean;
	};
};

type ApiSuccess = JsonApiResponse<DoctorFoldersResult>;

export interface GetDoctorFoldersArgs {
	page: number;
	page_size: number;
	search?: string;
}

export const getDoctorFolders = async (
	args: GetDoctorFoldersArgs,
): Promise<DoctorFoldersResult> => {
	const query = new URLSearchParams({
		page: String(args.page),
		page_size: String(args.page_size),
	});

	if (args.search?.trim()) query.set("search", args.search.trim());

	const response = await fetch(
		`${API_ROUTES.ADMIN.FILES.DOCTORS.LIST.path}?${query.toString()}`,
		{
			method: API_ROUTES.ADMIN.FILES.DOCTORS.LIST.method,
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

export const useDoctorFoldersQuery = (args: GetDoctorFoldersArgs) =>
	useQuery({
		queryKey: [
			API_ROUTES.ADMIN.FILES.DOCTORS.LIST.key,
			args.page,
			args.page_size,
			args.search ?? "",
		],
		queryFn: () => getDoctorFolders(args),
		placeholderData: (previous) => previous,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
