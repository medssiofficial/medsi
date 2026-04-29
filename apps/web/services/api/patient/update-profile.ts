import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "../http-error";
import type { PatientProfile } from "./get-profile";

export const updatePatientProfile = async (payload: PatientProfile) => {
	const response = await fetch(API_ROUTES.PATIENT.PROFILE_UPDATE.path, {
		method: API_ROUTES.PATIENT.PROFILE_UPDATE.method,
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

export const useUpdatePatientProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.PATIENT.PROFILE_UPDATE.key],
		mutationFn: updatePatientProfile,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.PROFILE.key],
			});
			queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.ME.key],
			});
		},
	});
};
