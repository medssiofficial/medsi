"use client";

import { useDoctorMe } from "@/services/api/doctor/get-me";
import { HttpError } from "@/services/api/http-error";
import { useMemo } from "react";
import { computeOnboardingCompletionPercent } from "../../lib/onboarding-state";

export const useOnboardHeader = () => {
	const doctorMeQuery = useDoctorMe();

	const doctor = doctorMeQuery.isSuccess ? doctorMeQuery.data : null;

	const isNotFound =
		doctorMeQuery.isError &&
		doctorMeQuery.error instanceof HttpError &&
		doctorMeQuery.error.status === 404;

	const completionPercent = useMemo(() => {
		if (isNotFound) return 0;
		return computeOnboardingCompletionPercent(doctor);
	}, [doctor, isNotFound]);

	return {
		completionPercent,
	};
};
