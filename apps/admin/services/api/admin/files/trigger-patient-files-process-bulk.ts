import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "../../http-error";

export const triggerAdminPatientFilesProcessBulk = async (args: {
	patientId: string;
}): Promise<{ queued: number; file_ids: string[] }> => {
	const url = `${API_ROUTES.ADMIN.FILES.PATIENTS.DETAIL.path}/${args.patientId}/files/process-bulk`;
	const response = await fetch(url, {
		method: "POST",
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

export const useTriggerAdminPatientFilesProcessBulkMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["admin.files.patients.files.process-bulk"],
		mutationFn: triggerAdminPatientFilesProcessBulk,
		onSuccess: (_data, args) => {
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.ADMIN.FILES.PATIENTS.DETAIL.key, args.patientId],
			});
		},
	});
};
