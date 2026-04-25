"use client";

import type { DoctorMe } from "@/services/api/doctor/get-me";
import { useDoctorMe } from "@/services/api/doctor/get-me";
import { HttpError } from "@/services/api/http-error";
import { useMemo } from "react";

const computeCompletionPercent = (doctor: DoctorMe | null | undefined) => {
	if (!doctor?.profile) return 0;

	const checks: boolean[] = [
		Boolean(doctor.profile.name?.trim()),
		Boolean(doctor.profile.email?.trim()),
		Boolean(doctor.profile.mobile_number?.trim()),
		Boolean(doctor.profile.country?.trim()),
		Number(doctor.profile.years_of_experience) >= 0,
		Boolean(doctor.profile.address_line_1?.trim()),
		Boolean(doctor.profile.city?.trim()),
		Boolean(doctor.profile.county?.trim()),
		Array.isArray(doctor.expertises) && doctor.expertises.length > 0,
		Array.isArray(doctor.specializations) &&
			doctor.specializations.length > 0,
		(doctor.specializations ?? []).every(
			(s) =>
				Boolean(s.certificate_file_key?.trim()) &&
				s.certificate_file_key !== "pending",
		),
		Boolean(doctor.profile.medical_registration_number?.trim()),
		Boolean(doctor.profile.current_institution?.trim()),
		typeof doctor.profile.years_in_practice === "number" &&
			doctor.profile.years_in_practice >= 0,
		Boolean(doctor.profile.type_of_doctor?.trim()),
	];

	const total = checks.length;
	const passed = checks.filter(Boolean).length;

	return Math.round((passed / total) * 100);
};

export const useOnboardHeader = () => {
	const doctorMeQuery = useDoctorMe();

	const doctor = doctorMeQuery.isSuccess ? doctorMeQuery.data : null;

	const isNotFound =
		doctorMeQuery.isError &&
		doctorMeQuery.error instanceof HttpError &&
		doctorMeQuery.error.status === 404;

	const completionPercent = useMemo(() => {
		if (isNotFound) return 0;
		return computeCompletionPercent(doctor);
	}, [doctor, isNotFound]);

	return {
		completionPercent,
	};
};
