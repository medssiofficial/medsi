"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import z from "zod";
import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import {
	type PatientSettings,
	usePatientSettings,
} from "@/services/api/patient/get-settings";
import { useUpdatePatientSettings } from "@/services/api/patient/update-settings";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SIGN_IN_URL } from "@/config/client-constants";

const SettingsSchema = z.object({
	notifications_enabled: z.boolean(),
	language: z.string().trim().min(1),
	data_sharing: z.enum(["limited", "full"]),
});

export type SettingsFormValues = z.infer<typeof SettingsSchema>;

const DEFAULT_VALUES: SettingsFormValues = {
	notifications_enabled: true,
	language: "English",
	data_sharing: "limited",
};

export const useSettingsScreen = () => {
	const router = useRouter();
	const clerk = useClerk();
	const { APIErrorHandler } = useAPIErrorHandler();
	const settingsQuery = usePatientSettings();
	const updateMutation = useUpdatePatientSettings();

	const form = useForm<SettingsFormValues>({
		resolver: zodResolver(SettingsSchema),
		defaultValues: DEFAULT_VALUES,
	});

	const values = useMemo<SettingsFormValues>(() => {
		if (!settingsQuery.data) return DEFAULT_VALUES;
		return settingsQuery.data;
	}, [settingsQuery.data]);

	useEffect(() => {
		form.reset(values);
	}, [form, values]);

	const handleSubmit = async () => {
		const isValid = await form.trigger();
		if (!isValid) return;

		try {
			await updateMutation.mutateAsync(form.getValues() as PatientSettings);
			toast.success("Settings updated.");
		} catch (error) {
			APIErrorHandler()(error);
		}
	};

	const handleLogout = async () => {
		await clerk.signOut({ redirectUrl: SIGN_IN_URL });
		router.replace(SIGN_IN_URL);
	};

	return {
		form,
		settingsQuery,
		isSaving: updateMutation.isPending,
		handleSubmit,
		handleLogout,
	};
};
