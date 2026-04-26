"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import type { DoctorMe } from "@/services/api/doctor/get-me";
import { useUpdateDoctorOnboardingExpertises } from "@/services/api/doctor/onboarding/update-expertises";
import {
	type DoctorOnboardingSpecializationInput,
	useUpdateDoctorOnboardingSpecializations,
} from "@/services/api/doctor/onboarding/update-specializations";
import { useUploadDoctorProof } from "@/services/api/doctor/onboarding/upload-proof";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const normalize = (value: unknown): string => {
	if (typeof value === "string") return value;
	return "";
};

type SpecializationFormItem = DoctorOnboardingSpecializationInput & {
	client_id: string;
	certificate_file?: {
		filename: string;
	} | null;
};

const createClientId = () =>
	`spec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const useSpecializationExpertiseSection = (args: {
	doctor: DoctorMe | null;
}) => {
	const { doctor } = args;
	const { APIErrorHandler } = useAPIErrorHandler();

	const updateExpertisesMutation = useUpdateDoctorOnboardingExpertises();
	const updateSpecializationsMutation =
		useUpdateDoctorOnboardingSpecializations();
	const uploadProofMutation = useUploadDoctorProof();

	const initialSpecializations = useMemo<SpecializationFormItem[]>(
		() =>
			(doctor?.specializations ?? []).map((s) => ({
				id: s.id,
				client_id: s.id,
				name: s.name,
				certificate_file_key: s.certificate_file_key,
				certificate_file_id: s.certificate_file_id ?? undefined,
				certificate_file: s.certificate_file
					? { filename: s.certificate_file.filename }
					: null,
			})),
		[doctor?.specializations],
	);

	const initialExpertises = useMemo<string[]>(
		() => (doctor?.expertises ?? []).map((e) => e.expertise),
		[doctor?.expertises],
	);

	const [specializations, setSpecializations] = useState<SpecializationFormItem[]>(
		initialSpecializations.length
			? initialSpecializations
			: [{ client_id: createClientId(), name: "", certificate_file_key: "" }],
	);
	const [expertises, setExpertises] = useState<string[]>(initialExpertises);
	const [expertiseInput, setExpertiseInput] = useState("");
	const [hasLocalSpecializationEdits, setHasLocalSpecializationEdits] =
		useState(false);
	const [hasLocalExpertiseEdits, setHasLocalExpertiseEdits] = useState(false);
	const [activeSpecializationProofId, setActiveSpecializationProofId] = useState<
		string | null
	>(null);

	useEffect(() => {
		if (hasLocalSpecializationEdits) return;
		setSpecializations(
			initialSpecializations.length
				? initialSpecializations
				: [{ client_id: createClientId(), name: "", certificate_file_key: "" }],
		);
	}, [hasLocalSpecializationEdits, initialSpecializations]);

	useEffect(() => {
		if (hasLocalExpertiseEdits) return;
		setExpertises(initialExpertises);
	}, [hasLocalExpertiseEdits, initialExpertises]);

	const addExpertise = () => {
		const v = expertiseInput.trim();
		if (!v) return;
		if (expertises.includes(v)) return;
		setHasLocalExpertiseEdits(true);
		setExpertises((prev) => [...prev, v]);
		setExpertiseInput("");
	};

	const removeExpertise = (value: string) => {
		setHasLocalExpertiseEdits(true);
		setExpertises((prev) => prev.filter((e) => e !== value));
	};

	const addSpecializationRow = () => {
		setHasLocalSpecializationEdits(true);
		setSpecializations((prev) => [
			...prev,
			{ client_id: createClientId(), name: "", certificate_file_key: "" },
		]);
	};

	const removeSpecializationRow = (index: number) => {
		setHasLocalSpecializationEdits(true);
		setSpecializations((prev) => prev.filter((_, i) => i !== index));
	};

	const updateSpecializationField = (
		index: number,
		field: "name" | "certificate_file_key",
		value: string,
	) => {
		setHasLocalSpecializationEdits(true);
		setSpecializations((prev) =>
			prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
		);
	};

	const handleSaveExpertises = async () => {
		try {
			await updateExpertisesMutation.mutateAsync(expertises);
			setHasLocalExpertiseEdits(false);
			toast.success("Expertise saved.");
		} catch (e) {
			APIErrorHandler()(e);
		}
	};

	const handleSaveSpecializations = async () => {
		const cleaned = specializations
			.map((s) => ({
				id: s.id,
				name: normalize(s.name).trim(),
				certificate_file_key: normalize(s.certificate_file_key).trim(),
				certificate_file_id: s.certificate_file_id,
			}))
			.filter((s) => Boolean(s.name));

		try {
			await updateSpecializationsMutation.mutateAsync(cleaned);
			setHasLocalSpecializationEdits(false);
			toast.success("Specialisations saved.");
		} catch (e) {
			APIErrorHandler()(e);
		}
	};

	const handleUploadSpecializationProof = async (
		specializationId: string,
		file: File | null,
	) => {
		if (!file) return;

		setActiveSpecializationProofId(specializationId);
		try {
			await uploadProofMutation.mutateAsync({
				proof_type: "specialization_supporting_document",
				specialization_id: specializationId,
				file,
			});
			toast.success("Specialization proof uploaded.");
		} catch (error) {
			APIErrorHandler()(error);
		} finally {
			setActiveSpecializationProofId(null);
		}
	};

	return {
		specializations,
		expertises,
		expertiseInput,
		setExpertiseInput,
		addExpertise,
		removeExpertise,
		addSpecializationRow,
		removeSpecializationRow,
		updateSpecializationField,
		handleSaveExpertises,
		handleSaveSpecializations,
		handleUploadSpecializationProof,
		activeSpecializationProofId,
		isSavingExpertises: updateExpertisesMutation.isPending,
		isSavingSpecializations: updateSpecializationsMutation.isPending,
		isUploadingSpecializationProof: uploadProofMutation.isPending,
	};
};
