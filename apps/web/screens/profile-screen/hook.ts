"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import z from "zod";
import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import {
	type PatientProfile,
	usePatientProfile,
} from "@/services/api/patient/get-profile";
import { useUpdatePatientProfile } from "@/services/api/patient/update-profile";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SIGN_IN_URL } from "@/config/client-constants";

const ProfileSchema = z.object({
	name: z.string().trim().min(1, { error: "Name is required." }),
	age: z.number().int().min(1, { error: "Age is required." }),
	gender: z.enum(["male", "female", "other"]),
	email: z.email({ error: "Please provide a valid email." }),
	phone: z.string().trim().min(3, { error: "Phone is required." }),
	country: z.string().trim().min(1, { error: "Country is required." }),
});

export type ProfileFormValues = z.infer<typeof ProfileSchema>;

const DEFAULT_VALUES: ProfileFormValues = {
	name: "",
	age: 0,
	gender: "male",
	email: "",
	phone: "",
	country: "",
};

export const useProfileScreen = () => {
	const router = useRouter();
	const clerk = useClerk();
	const { APIErrorHandler } = useAPIErrorHandler();
	const profileQuery = usePatientProfile();
	const updateMutation = useUpdatePatientProfile();
	const clerkUser = useUser();
	const [isEditing, setIsEditing] = useState(false);

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(ProfileSchema),
		defaultValues: DEFAULT_VALUES,
		mode: "onSubmit",
	});

	const profileValues = useMemo<ProfileFormValues>(() => {
		const profile = profileQuery.data;
		if (!profile) return DEFAULT_VALUES;
		return {
			name: profile.name,
			age: profile.age,
			gender: profile.gender,
			email: profile.email,
			phone: profile.phone,
			country: profile.country,
		};
	}, [profileQuery.data]);

	useEffect(() => {
		form.reset(profileValues);
	}, [form, profileValues]);

	const handleSubmit = async () => {
		if (!isEditing) return;

		const isValid = await form.trigger();
		if (!isValid) return;

		try {
			await updateMutation.mutateAsync(form.getValues() as PatientProfile);
			toast.success("Profile updated successfully.");
			setIsEditing(false);
		} catch (error) {
			APIErrorHandler()(error);
		}
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		form.reset(profileValues);
		setIsEditing(false);
	};

	const handleLogout = async () => {
		await clerk.signOut({ redirectUrl: SIGN_IN_URL });
		router.replace(SIGN_IN_URL);
	};

	return {
		form,
		profileQuery,
		isSaving: updateMutation.isPending,
		isEditing,
		handleSubmit,
		handleEdit,
		handleCancelEdit,
		handleLogout,
		clerkUser,
	};
};
