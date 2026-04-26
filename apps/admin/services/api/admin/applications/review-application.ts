import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";
import type { AdminApplicationDetail } from "./types";
import type { DoctorApplicationStatus } from "@repo/database/actions/doctor";

type ApiSuccess = JsonApiResponse<{
	application: AdminApplicationDetail;
}>;

interface ReviewDoctorApplicationArgs {
	application_id: string;
	status: DoctorApplicationStatus;
	rejection_reason?: string;
}

export const reviewDoctorApplication = async (
	args: ReviewDoctorApplicationArgs,
): Promise<AdminApplicationDetail> => {
	const response = await fetch(
		`${API_ROUTES.ADMIN.APPLICATIONS.REVIEW.path}/${args.application_id}/review`,
		{
			method: API_ROUTES.ADMIN.APPLICATIONS.REVIEW.method,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				status: args.status,
				rejection_reason: args.rejection_reason,
			}),
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
		"application" in apiJson.data
	) {
		return (apiJson.data as { application: AdminApplicationDetail }).application;
	}

	throw new Error("Invalid response.");
};

export const useReviewDoctorApplicationMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.ADMIN.APPLICATIONS.REVIEW.key],
		mutationFn: reviewDoctorApplication,
		onSuccess: (application) => {
			queryClient.invalidateQueries({
				queryKey: [API_ROUTES.ADMIN.APPLICATIONS.LIST.key],
			});

			queryClient.setQueryData(
				[API_ROUTES.ADMIN.APPLICATIONS.DETAIL.key, application.id],
				application,
			);
		},
	});
};
