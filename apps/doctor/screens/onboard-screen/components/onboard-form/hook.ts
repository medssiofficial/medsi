"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import type { DoctorMe } from "@/services/api/doctor/get-me";
import { useDoctorMe } from "@/services/api/doctor/get-me";
import { HttpError } from "@/services/api/http-error";
import { useEffect, useMemo } from "react";
import {
	computeOnboardingCompletionPercent,
	hasMandatoryOnboardingFieldsForSubmit,
} from "../../lib/onboarding-state";

export const useOnboardForm = () => {
	const { APIErrorHandler } = useAPIErrorHandler();

	const doctorMeQuery = useDoctorMe();

	const doctor = doctorMeQuery.isSuccess ? doctorMeQuery.data : null;

	const isNotFound =
		doctorMeQuery.isError &&
		doctorMeQuery.error instanceof HttpError &&
		doctorMeQuery.error.status === 404;

	useEffect(() => {
		if (!doctorMeQuery.isError) return;
		if (isNotFound) return;
		APIErrorHandler()(doctorMeQuery.error);
	}, [
		APIErrorHandler,
		doctorMeQuery.error,
		doctorMeQuery.isError,
		isNotFound,
	]);

	const completionPercent = useMemo(
		() => computeOnboardingCompletionPercent(doctor),
		[doctor],
	);

	const applicationStatus = doctor?.application?.status ?? null;

	const isUnderReview = applicationStatus === "under_review";

	const canSubmit =
		hasMandatoryOnboardingFieldsForSubmit(doctor) &&
		applicationStatus !== "under_review" &&
		applicationStatus !== "approved";

	return {
		doctor,
		isLoading: doctorMeQuery.isLoading || doctorMeQuery.isFetching,
		isNotFound,
		completionPercent,
		isUnderReview,
		canSubmit,
	};
};
