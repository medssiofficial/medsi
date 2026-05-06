import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { listPatientFileProcessingLogsForPatient } from "@repo/database/actions/patient-file-processing";
import { HttpError } from "../http-error";

export type PatientFileProcessingLogsPage = Awaited<
	ReturnType<typeof listPatientFileProcessingLogsForPatient>
>;

const buildQuery = (args?: { page?: number; page_size?: number }) => {
	const query = new URLSearchParams({
		page: String(args?.page ?? 1),
		page_size: String(args?.page_size ?? 20),
	});
	return query.toString();
};

export const getPatientFileProcessingLogs = async (args?: {
	page?: number;
	page_size?: number;
}): Promise<PatientFileProcessingLogsPage> => {
	const response = await fetch(
		`${API_ROUTES.PATIENT.FILE_PROCESSING_LOGS.path}?${buildQuery(args)}`,
		{
			method: API_ROUTES.PATIENT.FILE_PROCESSING_LOGS.method,
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

	if (
		typeof json === "object" &&
		json !== null &&
		"success" in json &&
		(json as { success?: unknown }).success === true &&
		"data" in json
	) {
		return (json as { data: PatientFileProcessingLogsPage }).data;
	}

	throw new Error("Invalid response.");
};

export const usePatientFileProcessingLogsQuery = (args?: {
	page?: number;
	page_size?: number;
}) =>
	useQuery({
		queryKey: [
			API_ROUTES.PATIENT.FILE_PROCESSING_LOGS.key,
			args?.page ?? 1,
			args?.page_size ?? 20,
		],
		queryFn: () => getPatientFileProcessingLogs(args),
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
