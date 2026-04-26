import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DoctorMe } from "../get-me";
import { HttpError } from "../../http-error";

export type UploadDoctorProofType =
	| "medical_license"
	| "board_certification"
	| "government_id_front"
	| "government_id_back"
	| "specialization_supporting_document"
	| "experience_supporting_document";

type ApiSuccess = {
	success: true;
	code: number;
	data: {
		doctor: DoctorMe;
	};
};

export interface UploadDoctorProofInput {
	file: File;
	proof_type: UploadDoctorProofType;
	specialization_id?: string;
}

export const uploadDoctorProof = async (
	args: UploadDoctorProofInput,
): Promise<DoctorMe> => {
	const formData = new FormData();
	formData.append("file", args.file);
	formData.append("proof_type", args.proof_type);
	if (args.specialization_id) {
		formData.append("specialization_id", args.specialization_id);
	}

	const response = await fetch(API_ROUTES.DOCTOR.ONBOARDING.UPLOAD_PROOF.path, {
		method: API_ROUTES.DOCTOR.ONBOARDING.UPLOAD_PROOF.method,
		body: formData,
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

export const useUploadDoctorProof = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.DOCTOR.ONBOARDING.UPLOAD_PROOF.key],
		mutationFn: uploadDoctorProof,
		onSuccess: (doctor) => {
			queryClient.setQueryData([API_ROUTES.DOCTOR.ME.key], doctor);
		},
	});
};
