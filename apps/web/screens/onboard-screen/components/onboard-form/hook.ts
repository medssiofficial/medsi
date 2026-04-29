"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { usePatientMe } from "@/services/api/patient/get-me";
import {
	type PatientOnboardingProfileInput,
	useUpsertPatientOnboardingProfile,
} from "@/services/api/patient/upsert-onboarding-profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";
import { DASHBOARD_URL } from "@/config/client-constants";

const OnboardSchema = z.object({
	name: z.string().trim().min(1, { error: "Name is required." }),
	age: z.number().int().min(1, { error: "Age is required." }),
	gender: z.enum(["male", "female", "other"], {
		error: "Gender is required.",
	}),
	email: z.email({ error: "Please provide a valid email." }),
	phone: z.string().trim().min(3, { error: "Phone is required." }),
	country: z.string().trim().min(1, { error: "Country is required." }),
});

export type OnboardFormValues = z.infer<typeof OnboardSchema>;

export const useOnboardForm = () => {
	const router = useRouter();
	const { APIErrorHandler } = useAPIErrorHandler();
	const patientMeQuery = usePatientMe();
	const upsertProfileMutation = useUpsertPatientOnboardingProfile();

	const defaultValues = useMemo<OnboardFormValues>(() => {
		const profile = patientMeQuery.data?.patient?.profile;

		return {
			name: profile?.name ?? "",
			age: profile?.age ?? 0,
			gender: profile?.gender ?? "male",
			email: profile?.email ?? "",
			phone: profile?.phone ?? "",
			country: profile?.country ?? "",
		};
	}, [patientMeQuery.data?.patient?.profile]);

	const form = useForm<OnboardFormValues>({
		resolver: zodResolver(OnboardSchema),
		defaultValues,
		mode: "onSubmit",
	});

	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	const handleSubmit = async () => {
		const isValid = await form.trigger();
		if (!isValid) return;

		const values = form.getValues();
		const payload: PatientOnboardingProfileInput = {
			name: values.name,
			age: values.age,
			gender: values.gender,
			email: values.email,
			phone: values.phone,
			country: values.country,
		};

		try {
			await upsertProfileMutation.mutateAsync(payload);
			toast.success("Profile saved successfully.");
			router.replace(DASHBOARD_URL);
		} catch (error) {
			APIErrorHandler()(error);
		}
	};

	return {
		form,
		isLoadingPatient: patientMeQuery.isLoading,
		isSaving: upsertProfileMutation.isPending,
		handleSubmit,
	};
};
