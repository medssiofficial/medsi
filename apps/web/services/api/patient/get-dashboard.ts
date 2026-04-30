import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { getPatientDashboardOverviewByClerkId } from "@repo/database/actions/patient";
import { HttpError } from "../http-error";

export type PatientDashboardOverview = Awaited<
	ReturnType<typeof getPatientDashboardOverviewByClerkId>
>;

export const getPatientDashboardOverview =
	async (): Promise<PatientDashboardOverview> => {
		const response = await fetch(API_ROUTES.PATIENT.DASHBOARD.path, {
			method: API_ROUTES.PATIENT.DASHBOARD.method,
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
			if (
				typeof json === "object" &&
				json !== null &&
				"message" in json &&
				typeof (json as { message?: unknown }).message === "string"
			) {
				message = (json as { message: string }).message;
			}
			throw new HttpError({ status: response.status, message });
		}

		if (
			typeof json === "object" &&
			json !== null &&
			"data" in json &&
			typeof (json as { data?: unknown }).data === "object" &&
			(json as { data: { overview?: PatientDashboardOverview } }).data?.overview
		) {
			return (json as { data: { overview: PatientDashboardOverview } }).data
				.overview;
		}

		throw new Error("Invalid response.");
	};

export const usePatientDashboardOverview = () => {
	return useQuery({
		queryKey: [API_ROUTES.PATIENT.DASHBOARD.key],
		queryFn: getPatientDashboardOverview,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};
