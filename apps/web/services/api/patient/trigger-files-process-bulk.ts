import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "../http-error";

export const triggerPatientFilesProcessBulk = async (): Promise<{
	queued: number;
	file_ids: string[];
}> => {
	const response = await fetch(API_ROUTES.PATIENT.FILES_PROCESS_BULK.path, {
		method: API_ROUTES.PATIENT.FILES_PROCESS_BULK.method,
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

	if (
		typeof json === "object" &&
		json !== null &&
		"data" in json &&
		typeof (json as { data?: unknown }).data === "object"
	) {
		const data = (json as { data: { queued: number; file_ids: string[] } }).data;
		if (typeof data.queued === "number" && Array.isArray(data.file_ids)) {
			return data;
		}
	}

	throw new Error("Invalid response.");
};

export const useTriggerPatientFilesProcessBulkMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.PATIENT.FILES_PROCESS_BULK.key],
		mutationFn: triggerPatientFilesProcessBulk,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.FILES.key],
			});
		},
	});
};
