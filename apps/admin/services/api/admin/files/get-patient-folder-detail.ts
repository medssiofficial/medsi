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
		processing_status: "pending" | "processing" | "completed" | "failed";
		created_at: string | Date;
		public_url: string | null;
	}>;
};

type ApiSuccess = JsonApiResponse<PatientFolderDetail>;

export const getPatientFolderDetail = async (
	patientId: string,
): Promise<PatientFolderDetail> => {
	const response = await fetch(
		`${API_ROUTES.ADMIN.FILES.PATIENTS.DETAIL.path}/${patientId}`,
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

export const usePatientFolderDetailQuery = (patientId: string) =>
	useQuery({
		queryKey: [API_ROUTES.ADMIN.FILES.PATIENTS.DETAIL.key, patientId],
		queryFn: () => getPatientFolderDetail(patientId),
		enabled: Boolean(patientId),
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
