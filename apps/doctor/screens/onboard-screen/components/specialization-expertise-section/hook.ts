"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import type { DoctorMe } from "@/services/api/doctor/get-me";
import { useUpdateDoctorOnboardingExpertises } from "@/services/api/doctor/onboarding/update-expertises";
import {
	type DoctorOnboardingSpecializationInput,
	useUpdateDoctorOnboardingSpecializations,
} from "@/services/api/doctor/onboarding/update-specializations";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const normalize = (value: unknown): string => {
	if (typeof value === "string") return value;
	return "";
};

export const useSpecializationExpertiseSection = (args: {
	doctor: DoctorMe | null;
}) => {
	const { doctor } = args;
	const { APIErrorHandler } = useAPIErrorHandler();

	const updateExpertisesMutation = useUpdateDoctorOnboardingExpertises();
	const updateSpecializationsMutation =
		useUpdateDoctorOnboardingSpecializations();

	const initialSpecializations = useMemo<
		DoctorOnboardingSpecializationInput[]
	>(
		() =>
			(doctor?.specializations ?? []).map((s) => ({
				name: s.name,
				certificate_file_key: s.certificate_file_key,
			})),
		[doctor?.specializations],
	);

	const initialExpertises = useMemo<string[]>(
		() => (doctor?.expertises ?? []).map((e) => e.expertise),
		[doctor?.expertises],
	);

	const [specializations, setSpecializations] = useState<
		DoctorOnboardingSpecializationInput[]
	>(
		initialSpecializations.length
			? initialSpecializations
			: [{ name: "", certificate_file_key: "" }],
	);
	const [expertises, setExpertises] = useState<string[]>(initialExpertises);
	const [expertiseInput, setExpertiseInput] = useState("");

	const addExpertise = () => {
		const v = expertiseInput.trim();
		if (!v) return;
		if (expertises.includes(v)) return;
		setExpertises((prev) => [...prev, v]);
		setExpertiseInput("");
	};

	const removeExpertise = (value: string) => {
		setExpertises((prev) => prev.filter((e) => e !== value));
	};

	const addSpecializationRow = () => {
		setSpecializations((prev) => [
			...prev,
			{ name: "", certificate_file_key: "" },
		]);
	};

	const removeSpecializationRow = (index: number) => {
		setSpecializations((prev) => prev.filter((_, i) => i !== index));
	};

	const updateSpecializationField = (
		index: number,
		field: "name" | "certificate_file_key",
		value: string,
	) => {
		setSpecializations((prev) =>
			prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
		);
	};

	const handleSaveExpertises = async () => {
		try {
			await updateExpertisesMutation.mutateAsync(expertises);
			toast.success("Expertise saved.");
		} catch (e) {
			APIErrorHandler()(e);
		}
	};

	const handleSaveSpecializations = async () => {
		const cleaned = specializations
			.map((s) => ({
				name: normalize(s.name).trim(),
				certificate_file_key: normalize(s.certificate_file_key).trim(),
			}))
			.filter((s) => Boolean(s.name));

		try {
			await updateSpecializationsMutation.mutateAsync(cleaned);
			toast.success("Specialisations saved.");
		} catch (e) {
			APIErrorHandler()(e);
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
		isSavingExpertises: updateExpertisesMutation.isPending,
		isSavingSpecializations: updateSpecializationsMutation.isPending,
	};
};
