"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import type { DoctorMe } from "@/services/api/doctor/get-me";
import {
	type UploadDoctorProofType,
	useUploadDoctorProof,
} from "@/services/api/doctor/onboarding/upload-proof";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const useCredentialUploadsSection = (args: { doctor: DoctorMe | null }) => {
	const { doctor } = args;
	const { APIErrorHandler } = useAPIErrorHandler();
	const uploadProofMutation = useUploadDoctorProof();
	const [activeProofType, setActiveProofType] =
		useState<UploadDoctorProofType | null>(null);

	const items = useMemo(() => {
		const profile = doctor?.profile;
		return [
			{
				label: "Medical License",
				proof_type: "medical_license" as const,
				progress: profile?.medical_license_file ? 100 : 0,
				status: profile?.medical_license_file ? "Uploaded" : "Not started",
				file_name: profile?.medical_license_file?.filename ?? null,
			},
			{
				label: "Board Certification",
				proof_type: "board_certification" as const,
				progress: profile?.board_certification_file ? 100 : 0,
				status: profile?.board_certification_file ? "Uploaded" : "Not started",
				file_name: profile?.board_certification_file?.filename ?? null,
			},
			{
				label: "Government ID (Front)",
				proof_type: "government_id_front" as const,
				progress: profile?.government_id_front_file ? 100 : 0,
				status: profile?.government_id_front_file ? "Uploaded" : "Not started",
				file_name: profile?.government_id_front_file?.filename ?? null,
			},
			{
				label: "Government ID (Back)",
				proof_type: "government_id_back" as const,
				progress: profile?.government_id_back_file ? 100 : 0,
				status: profile?.government_id_back_file ? "Uploaded" : "Not started",
				file_name: profile?.government_id_back_file?.filename ?? null,
			},
		];
	}, [doctor?.profile]);

	const handleUploadProof = async (
		proofType: UploadDoctorProofType,
		file: File | null,
	) => {
		if (!file) return;

		setActiveProofType(proofType);
		try {
			await uploadProofMutation.mutateAsync({
				proof_type: proofType,
				file,
			});
			toast.success("File uploaded.");
		} catch (error) {
			APIErrorHandler()(error);
		} finally {
			setActiveProofType(null);
		}
	};

	return {
		items,
		handleUploadProof,
		activeProofType,
		isUploading: uploadProofMutation.isPending,
	};
};
