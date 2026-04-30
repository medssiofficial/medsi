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
};

type ApiSuccess = JsonApiResponse<DoctorFolderDetail>;

export const getDoctorFolderDetail = async (
	doctorId: string,
): Promise<DoctorFolderDetail> => {
	const response = await fetch(
		`${API_ROUTES.ADMIN.FILES.DOCTORS.DETAIL.path}/${doctorId}`,
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

export const useDoctorFolderDetailQuery = (doctorId: string) =>
	useQuery({
		queryKey: [API_ROUTES.ADMIN.FILES.DOCTORS.DETAIL.key, doctorId],
		queryFn: () => getDoctorFolderDetail(doctorId),
		enabled: Boolean(doctorId),
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
