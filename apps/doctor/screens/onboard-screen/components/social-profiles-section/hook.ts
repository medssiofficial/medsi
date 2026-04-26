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
	website_url: z.string().optional(),
	linkedin_url: z.string().optional(),
	profile_statement: z.string().optional(),
});

export type SocialProfilesFormValues = z.infer<typeof Schema>;

export const useSocialProfilesSection = (args: { doctor: DoctorMe | null }) => {
	const { doctor } = args;
	const { APIErrorHandler } = useAPIErrorHandler();

	const mutation = useUpdateDoctorOnboardingProfileMetadata();

	const defaultValues = useMemo<SocialProfilesFormValues>(() => {
		return {
			website_url: doctor?.profile?.website_url ?? "",
			linkedin_url: doctor?.profile?.linkedin_url ?? "",
			profile_statement: doctor?.profile?.profile_statement ?? "",
		};
	}, [doctor?.profile]);

	const form = useForm<SocialProfilesFormValues>({
		resolver: zodResolver(Schema),
		defaultValues,
		mode: "onSubmit",
	});

	useEffect(() => {
		form.reset(defaultValues);
	}, [defaultValues, form]);

	const handleSave = async () => {
		const values = form.getValues();
		try {
			await mutation.mutateAsync(values);
			toast.success("Social profiles saved.");
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
