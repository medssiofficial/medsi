"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import type { DoctorMe } from "@/services/api/doctor/get-me";
import { useSubmitDoctorOnboarding } from "@/services/api/doctor/onboarding/submit";
import { useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ONBOARD_UNDER_REVIEW_URL } from "@/config/client-constants";

export const useVerificationSection = (args: {
	doctor: DoctorMe | null;
	completionPercent: number;
	canSubmit: boolean;
}) => {
	const { doctor, completionPercent, canSubmit } = args;
	const { APIErrorHandler } = useAPIErrorHandler();
	const submitMutation = useSubmitDoctorOnboarding();
	const router = useRouter();

	const applicationStatus = doctor?.application?.status ?? null;

	const statusCards = useMemo(() => {
		const identityStatus =
			completionPercent >= 50 ? "completed" : "pending";
		const licenseStatus =
			applicationStatus === "under_review"
				? "in_progress"
				: completionPercent === 100
					? "ready"
					: "pending";
		const practiceStatus =
			applicationStatus === "under_review" ? "waiting_review" : "pending";

		return [
			{
				title: "Identity check passed",
				subtitle:
					identityStatus === "completed"
						? "Your identity details are saved."
						: "Complete your profile information.",
				tone: identityStatus === "completed" ? "good" : "muted",
			},
			{
				title:
					licenseStatus === "in_progress"
						? "License review in progress"
						: licenseStatus === "ready"
							? "License ready for review"
							: "License not submitted",
				subtitle:
					licenseStatus === "in_progress"
						? "Our team is reviewing your details."
						: licenseStatus === "ready"
							? "Submit your application to start review."
							: "Finish required fields before submitting.",
				tone:
					licenseStatus === "in_progress"
						? "warn"
						: licenseStatus === "ready"
							? "info"
							: "muted",
			},
			{
				title:
					practiceStatus === "waiting_review"
						? "Practice details review waiting"
						: "Practice details pending",
				subtitle:
					practiceStatus === "waiting_review"
						? "We will verify your practice details next."
						: "Complete work details section.",
				tone: practiceStatus === "waiting_review" ? "info" : "muted",
			},
		] as const;
	}, [applicationStatus, completionPercent]);

	const handleSubmit = async () => {
		if (!canSubmit) return;
		try {
			await submitMutation.mutateAsync();
			toast.success("Submitted for verification.");
			router.push(ONBOARD_UNDER_REVIEW_URL);
		} catch (e) {
			APIErrorHandler()(e);
		}
	};

	return {
		statusCards,
		isSubmitting: submitMutation.isPending,
		handleSubmit,
	};
};
