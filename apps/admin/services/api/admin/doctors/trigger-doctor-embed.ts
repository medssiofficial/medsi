import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";

import { HttpError } from "../../http-error";

type ApiSuccess = JsonApiResponse<{ trigger_run_id: string }>;

export const triggerDoctorEmbed = async (args: {
	doctor_id: string;
}): Promise<{ trigger_run_id: string }> => {
	const response = await fetch(
		`${API_ROUTES.ADMIN.DOCTORS.EMBED.path}/${args.doctor_id}/embed`,
		{
			method: API_ROUTES.ADMIN.DOCTORS.EMBED.method,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

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
		"trigger_run_id" in apiJson.data
	) {
		return {
			trigger_run_id: (apiJson.data as { trigger_run_id: string })
				.trigger_run_id,
		};
	}

	throw new Error("Invalid response.");
};

export const useTriggerDoctorEmbedMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: triggerDoctorEmbed,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [API_ROUTES.ADMIN.DOCTORS.LIST.key],
			});
			await queryClient.invalidateQueries({
				queryKey: [API_ROUTES.ADMIN.DOCTORS.DETAIL.key],
			});
			await queryClient.invalidateQueries({
				queryKey: [API_ROUTES.ADMIN.EMBEDDING_LOGS.LIST.key],
			});
		},
	});
};
