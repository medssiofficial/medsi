import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import { HttpError } from "../http-error";

export type PatientSettings = {
	notifications_enabled: boolean;
	language: string;
	data_sharing: "limited" | "full";
};

export const getPatientSettings = async (): Promise<PatientSettings> => {
	const response = await fetch(API_ROUTES.PATIENT.SETTINGS.path, {
		method: API_ROUTES.PATIENT.SETTINGS.method,
		headers: { "Content-Type": "application/json" },
	});

	let json: unknown = null;
	try {
		json = await response.json();
	} catch {
		json = null;
	}

	if (!response.ok) {
		throw new HttpError({
			status: response.status,
			message: response.statusText,
		});
	}

	if (
		typeof json === "object" &&
		json !== null &&
		"data" in json &&
		typeof (json as { data?: unknown }).data === "object" &&
		(json as { data: { settings?: PatientSettings } }).data?.settings
	) {
		return (json as { data: { settings: PatientSettings } }).data.settings;
	}

	throw new Error("Invalid response.");
};

export const usePatientSettings = () => {
	return useQuery({
		queryKey: [API_ROUTES.PATIENT.SETTINGS.key],
		queryFn: getPatientSettings,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};
