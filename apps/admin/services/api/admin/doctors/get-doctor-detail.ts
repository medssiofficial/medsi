import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";

export type DoctorDetail = {
	id: string;
	clerk_id: string;
	verified: boolean;
	created_at: string | Date;
	profile: {
		name: string | null;
		email: string | null;
		mobile_number: string | null;
		country: string | null;
		city: string | null;
		county: string | null;
		years_of_experience: number | string | null;
		years_in_practice: number | null;
		medical_registration_number: string | null;
		current_institution: string | null;
		type_of_doctor: string | null;
	} | null;
	specializations: Array<{ name: string; certificate_file_key: string }>;
	expertises: Array<{ expertise: string }>;
	experiences: Array<{
		hospital_name: string;
		start_date: string | Date;
		end_date: string | Date;
		experience_letter_file_key: string | null;
	}>;
	application: {
		status: string;
		rejection_reason: string | null;
		created_at: string | Date;
	} | null;
};

type ApiSuccess = JsonApiResponse<{ doctor: DoctorDetail }>;

export const getAdminDoctorDetail = async (args: {
	doctor_id: string;
}): Promise<DoctorDetail> => {
	const response = await fetch(
		`${API_ROUTES.ADMIN.DOCTORS.DETAIL.path}/${args.doctor_id}`,
		{
			method: API_ROUTES.ADMIN.DOCTORS.DETAIL.method,
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
		"doctor" in apiJson.data
	) {
		return (apiJson.data as { doctor: DoctorDetail }).doctor;
	}

	throw new Error("Invalid response.");
};

export const useAdminDoctorDetailQuery = (args: {
	doctor_id: string | null;
	enabled?: boolean;
}) => {
	return useQuery({
		queryKey: [API_ROUTES.ADMIN.DOCTORS.DETAIL.key, args.doctor_id],
		queryFn: () =>
			getAdminDoctorDetail({
				doctor_id: args.doctor_id ?? "",
			}),
		enabled: Boolean(args.doctor_id) && (args.enabled ?? true),
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};
