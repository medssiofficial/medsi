"use client";

import type { DoctorMe } from "@/services/api/doctor/get-me";

const getMandatoryChecks = (doctor: DoctorMe | null | undefined): boolean[] => {
	if (!doctor?.profile) return [];

	return [
		Boolean(doctor.profile.name?.trim()),
		Boolean(doctor.profile.email?.trim()),
		Boolean(doctor.profile.mobile_number?.trim()),
		Boolean(doctor.profile.country?.trim()),
		Number(doctor.profile.years_of_experience) >= 0,
		Boolean(doctor.profile.address_line_1?.trim()),
		Boolean(doctor.profile.city?.trim()),
		Boolean(doctor.profile.county?.trim()),
		Array.isArray(doctor.expertises) && doctor.expertises.length > 0,
		Array.isArray(doctor.specializations) && doctor.specializations.length > 0,
		Boolean(doctor.profile.medical_registration_number?.trim()),
		Boolean(doctor.profile.current_institution?.trim()),
		typeof doctor.profile.years_in_practice === "number" &&
			doctor.profile.years_in_practice >= 0,
		Boolean(doctor.profile.type_of_doctor?.trim()),
		Boolean(doctor.profile.medical_license_file_id),
		Boolean(doctor.profile.board_certification_file_id),
		Boolean(doctor.profile.government_id_front_file_id),
		Boolean(doctor.profile.government_id_back_file_id),
	];
};

export const computeOnboardingCompletionPercent = (
	doctor: DoctorMe | null | undefined,
) => {
	const checks = getMandatoryChecks(doctor);
	if (!checks.length) return 0;

	const total = checks.length;
	const passed = checks.filter(Boolean).length;

	return Math.round((passed / total) * 100);
};

export const hasMandatoryOnboardingFieldsForSubmit = (
	doctor: DoctorMe | null | undefined,
) => {
	const checks = getMandatoryChecks(doctor);
	return checks.length > 0 && checks.every(Boolean);
};
