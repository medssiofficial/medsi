"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import {
	useDoctorOnboardingReviewStatus,
	type DoctorOnboardingReviewStatus,
} from "@/services/api/doctor/onboarding/get-review-status";
import { useEffect } from "react";

const formatSubmittedAt = (value: string) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleDateString(undefined, {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
};

export const useUnderReviewScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const query = useDoctorOnboardingReviewStatus();

	useEffect(() => {
		if (!query.isError) return;
		APIErrorHandler()(query.error);
	}, [APIErrorHandler, query.error, query.isError]);

	const data: DoctorOnboardingReviewStatus | null = query.isSuccess
		? query.data
		: null;

	return {
		isLoading: query.isLoading || query.isFetching,
		data,
		applicationId: data?.application_id ?? "-",
		submittedLabel: data?.submitted_at ? formatSubmittedAt(data.submitted_at) : "-",
	};
};
