import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import { HttpError } from "../../http-error";

type ReviewStatusApiSuccess = {
	success: true;
	code: number;
	data: {
		status: "pending" | "under_review" | "approved" | "rejected";
		application_id: string;
		submitted_at: string;
		documents: Array<{
			key: string;
			label: string;
			status: "uploaded" | "missing";
			url: string | null;
		}>;
	};
};

export type DoctorOnboardingReviewStatus = ReviewStatusApiSuccess["data"];

export const getDoctorOnboardingReviewStatus =
	async (): Promise<DoctorOnboardingReviewStatus> => {
		const response = await fetch(
			API_ROUTES.DOCTOR.ONBOARDING.REVIEW_STATUS.path,
			{
				method: API_ROUTES.DOCTOR.ONBOARDING.REVIEW_STATUS.method,
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

		const apiJson = json as ReviewStatusApiSuccess;
		if (
			apiJson &&
			typeof apiJson === "object" &&
			"success" in apiJson &&
			apiJson.success === true &&
			apiJson.data &&
			typeof apiJson.data === "object"
		) {
			return apiJson.data;
		}

		throw new Error("Invalid response.");
	};

export const useDoctorOnboardingReviewStatus = (args?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: [API_ROUTES.DOCTOR.ONBOARDING.REVIEW_STATUS.key],
		queryFn: getDoctorOnboardingReviewStatus,
		enabled: args?.enabled ?? true,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};
