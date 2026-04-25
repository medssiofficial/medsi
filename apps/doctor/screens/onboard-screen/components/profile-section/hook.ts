"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import type { DoctorMe } from "@/services/api/doctor/get-me";
import {
	type DoctorOnboardingProfileInput,
	useUpdateDoctorOnboardingProfile,
} from "@/services/api/doctor/onboarding/update-profile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const ProfileSchema = z.object({
	name: z.string().min(1, { error: "Full name is required." }),
	dob: z.string().min(1, { error: "Date of birth is required." }),
	gender: z.enum(["male", "female", "other"], {
		error: "Gender is required.",
	}),
	email: z.email({ error: "Please provide a valid email." }),
	mobile_number: z.string().min(3, { error: "Mobile number is required." }),
	country: z.string().min(1, { error: "Country is required." }),
	years_of_experience: z
		.number()
		.min(0, { error: "Years of experience must be 0 or more." }),
	address_line_1: z.string().min(1, { error: "Address is required." }),
	city: z.string().min(1, { error: "City is required." }),
	county: z.string().min(1, { error: "County is required." }),
});

export type ProfileFormValues = z.infer<typeof ProfileSchema>;

export const useProfileSection = (args: { doctor: DoctorMe | null }) => {
	const { doctor } = args;
	const { APIErrorHandler } = useAPIErrorHandler();

	const updateProfileMutation = useUpdateDoctorOnboardingProfile();

	const defaultValues = useMemo<ProfileFormValues>(() => {
		const dob =
			doctor?.profile?.dob instanceof Date
				? doctor.profile.dob.toISOString().slice(0, 10)
				: "";

		return {
			name: doctor?.profile?.name ?? "",
			dob,
			gender: doctor?.profile?.gender ?? "male",
			email: doctor?.profile?.email ?? "",
			mobile_number: doctor?.profile?.mobile_number ?? "",
			country: doctor?.profile?.country ?? "",
			years_of_experience: doctor?.profile
				? Number(doctor.profile.years_of_experience)
				: 0,
			address_line_1: doctor?.profile?.address_line_1 ?? "",
			city: doctor?.profile?.city ?? "",
			county: doctor?.profile?.county ?? "",
		};
	}, [doctor]);

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(ProfileSchema),
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
		const payload: DoctorOnboardingProfileInput = {
			years_of_experience: values.years_of_experience,
			name: values.name,
			dob: new Date(values.dob),
			gender: values.gender,
			email: values.email,
			mobile_number: values.mobile_number,
			country: values.country,
			address_line_1: values.address_line_1,
			city: values.city,
			county: values.county,
		};

		try {
			await updateProfileMutation.mutateAsync(payload);
			toast.success("Profile details saved.");
		} catch (e) {
			APIErrorHandler()(e);
		}
	};

	return {
		form,
		isSaving: updateProfileMutation.isPending,
		handleSave,
	};
};
