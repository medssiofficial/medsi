import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { PatientFileDetail } from "@repo/database/actions/patient";
import { HttpError } from "../http-error";

type ApiSuccess = { success: true; data: { file: PatientFileDetail } };

export const getPatientFileDetail = async (fileId: string): Promise<PatientFileDetail> => {
	const response = await fetch(`${API_ROUTES.PATIENT.FILE_DETAIL.path}/${fileId}`, {
		method: API_ROUTES.PATIENT.FILE_DETAIL.method,
		headers: { "Content-Type": "application/json" },
	});

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
	if (apiJson.success && apiJson.data?.file) return apiJson.data.file;
	throw new Error("Invalid response.");
};

export const usePatientFileDetailQuery = (fileId: string) =>
	useQuery({
		queryKey: [API_ROUTES.PATIENT.FILE_DETAIL.key, fileId],
		queryFn: () => getPatientFileDetail(fileId),
		enabled: Boolean(fileId),
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 0,
		refetchInterval: (query) => {
			const status = query.state.data?.processing_status;
			return status === "processing" ? 4000 : false;
		},
	});
