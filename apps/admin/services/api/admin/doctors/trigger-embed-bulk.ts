import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";

import { HttpError } from "../../http-error";

type ApiSuccess = JsonApiResponse<{
	queued: number;
	doctor_ids: string[];
}>;

export const triggerDoctorEmbedBulk = async (): Promise<{
	queued: number;
	doctor_ids: string[];
}> => {
	const response = await fetch(API_ROUTES.ADMIN.DOCTORS.EMBED_BULK.path, {
		method: API_ROUTES.ADMIN.DOCTORS.EMBED_BULK.method,
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
		"queued" in apiJson.data
	) {
		return apiJson.data as { queued: number; doctor_ids: string[] };
	}

	throw new Error("Invalid response.");
};

export const useTriggerDoctorEmbedBulkMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: triggerDoctorEmbedBulk,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [API_ROUTES.ADMIN.DOCTORS.LIST.key],
			});
			await queryClient.invalidateQueries({
				queryKey: [API_ROUTES.ADMIN.EMBEDDING_LOGS.LIST.key],
			});
		},
	});
};
