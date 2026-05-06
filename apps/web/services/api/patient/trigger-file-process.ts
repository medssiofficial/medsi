import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "../http-error";

export const triggerPatientFileProcess = async (
	fileId: string,
): Promise<{ trigger_run_id: string }> => {
	const response = await fetch(
		`${API_ROUTES.PATIENT.FILE_PROCESS.path}/${fileId}/process`,
		{
			method: API_ROUTES.PATIENT.FILE_PROCESS.method,
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

	const data = (json as { data?: { trigger_run_id?: unknown } }).data;
	if (
		data &&
		typeof data === "object" &&
		"trigger_run_id" in data &&
		typeof data.trigger_run_id === "string"
	) {
		return { trigger_run_id: data.trigger_run_id };
	}

	throw new Error("Invalid response.");
};

export const useTriggerPatientFileProcessMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.PATIENT.FILE_PROCESS.key],
		mutationFn: triggerPatientFileProcess,
		onSuccess: (_data, fileId) => {
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.FILES.key],
			});
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.FILE_DETAIL.key, fileId],
			});
		},
	});
};
