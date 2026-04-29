import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import { HttpError } from "../http-error";

export type PatientProfile = {
	name: string;
	age: number;
	gender: "male" | "female" | "other";
	email: string;
	phone: string;
	country: string;
};

export const getPatientProfile = async (): Promise<PatientProfile | null> => {
	const response = await fetch(API_ROUTES.PATIENT.PROFILE.path, {
		method: API_ROUTES.PATIENT.PROFILE.method,
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
		(json as { data: { profile?: PatientProfile | null } }).data
	) {
		return (json as { data: { profile?: PatientProfile | null } }).data.profile ?? null;
	}

	throw new Error("Invalid response.");
};

export const usePatientProfile = () => {
	return useQuery({
		queryKey: [API_ROUTES.PATIENT.PROFILE.key],
		queryFn: getPatientProfile,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};
