import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "../../http-error";

export const triggerAdminPatientFileProcess = async (args: {
	patientId: string;
	fileId: string;
}): Promise<{ trigger_run_id: string }> => {
	const base = `${API_ROUTES.ADMIN.FILES.PATIENTS.DETAIL.path}/${args.patientId}/files`;
	const response = await fetch(`${base}/${args.fileId}/process`, {
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

export const useTriggerAdminPatientFileProcessMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["admin.files.patients.file.process"],
		mutationFn: triggerAdminPatientFileProcess,
		onSuccess: (_data, args) => {
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.ADMIN.FILES.PATIENTS.DETAIL.key, args.patientId],
			});
		},
	});
};
