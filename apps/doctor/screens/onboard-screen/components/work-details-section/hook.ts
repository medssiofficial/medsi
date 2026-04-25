"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import type { DoctorMe } from "@/services/api/doctor/get-me";
import { useUpdateDoctorOnboardingProfileMetadata } from "@/services/api/doctor/onboarding/update-profile-metadata";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const Schema = z.object({
	medical_registration_number: z
		.string()
		.min(1, { error: "Medical registration number is required." }),
	current_institution: z
		.string()
		.min(1, { error: "Current institution is required." }),
	years_in_practice: z
		.number()
		.min(0, { error: "Years of practice must be 0 or more." }),
	type_of_doctor: z.enum(["telehealth", "hospital", "private", "hybrid"], {
		error: "Select a practice type.",
	}),
});

export type WorkDetailsFormValues = z.infer<typeof Schema>;

export const useWorkDetailsSection = (args: { doctor: DoctorMe | null }) => {
	const { doctor } = args;
	const { APIErrorHandler } = useAPIErrorHandler();

	const mutation = useUpdateDoctorOnboardingProfileMetadata();

	const defaultValues = useMemo<WorkDetailsFormValues>(() => {
		return {
			medical_registration_number:
				doctor?.profile?.medical_registration_number ?? "",
			current_institution: doctor?.profile?.current_institution ?? "",
			years_in_practice: doctor?.profile?.years_in_practice ?? 0,
			type_of_doctor:
				(doctor?.profile
					?.type_of_doctor as WorkDetailsFormValues["type_of_doctor"]) ??
				"telehealth",
		};
	}, [doctor?.profile]);

	const form = useForm<WorkDetailsFormValues>({
		resolver: zodResolver(Schema),
		defaultValues,
		mode: "onSubmit",
	});

	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	const handleSave = async () => {
		const isValid = await form.trigger();
		if (!isValid) return;

		const values = form.getValues();
		try {
			await mutation.mutateAsync(values);
			toast.success("Work details saved.");
		} catch (e) {
			APIErrorHandler()(e);
		}
	};

	return {
		form,
		isSaving: mutation.isPending,
		handleSave,
	};
};
