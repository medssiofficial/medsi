import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DoctorMe } from "../get-me";
import { HttpError } from "../../http-error";

type ApiSuccess = {
	success: true;
	code: number;
	data: {
		doctor: DoctorMe;
	};
};

export const submitDoctorOnboarding = async (): Promise<DoctorMe> => {
	const response = await fetch(API_ROUTES.DOCTOR.ONBOARDING.SUBMIT.path, {
		method: API_ROUTES.DOCTOR.ONBOARDING.SUBMIT.method,
		headers: {
			"Content-Type": "application/json",
		},
	});

	let json: unknown = null;
	try {
		json = (await response.json()) as unknown;
	} catch {
		json = null;
	}

	if (!response.ok) {
		let message = response.statusText;
		if (typeof json === "object" && json !== null) {
			if (
				"error" in json &&
				typeof (json as { error?: unknown }).error === "string"
			) {
				message = (json as { error: string }).error;
			} else if (
				"message" in json &&
				typeof (json as { message?: unknown }).message === "string"
			) {
				message = (json as { message: string }).message;
			}
		}

		throw new HttpError({ status: response.status, message });
	}

	const apiJson = json as ApiSuccess;
	if (
		apiJson &&
		typeof apiJson === "object" &&
		"success" in apiJson &&
		apiJson.success === true &&
		apiJson.data &&
		typeof apiJson.data === "object" &&
		"doctor" in apiJson.data
	) {
		return (apiJson.data as { doctor: DoctorMe }).doctor;
	}

	throw new Error("Invalid response.");
};

export const useSubmitDoctorOnboarding = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.DOCTOR.ONBOARDING.SUBMIT.key],
		mutationFn: submitDoctorOnboarding,
		onSuccess: (doctor) => {
			queryClient.setQueryData([API_ROUTES.DOCTOR.ME.key], doctor);
		},
	});
};
