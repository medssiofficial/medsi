import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "../http-error";
import type { PatientSettings } from "./get-settings";

export const updatePatientSettings = async (payload: PatientSettings) => {
	const response = await fetch(API_ROUTES.PATIENT.SETTINGS_UPDATE.path, {
		method: API_ROUTES.PATIENT.SETTINGS_UPDATE.method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new HttpError({
			status: response.status,
			message: response.statusText,
		});
	}
};

export const useUpdatePatientSettings = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.PATIENT.SETTINGS_UPDATE.key],
		mutationFn: updatePatientSettings,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.SETTINGS.key],
			});
		},
	});
};
