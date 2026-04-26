"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo } from "react";
import { useDoctorMe } from "@/services/api/doctor/get-me";
import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";

const getAge = (dob: Date | string | null | undefined) => {
	if (!dob) return null;

	const parsedDob = dob instanceof Date ? dob : new Date(dob);
	if (Number.isNaN(parsedDob.getTime())) return null;

	const today = new Date();
	let age = today.getFullYear() - parsedDob.getFullYear();
	const hasBirthdayPassed =
		today.getMonth() > parsedDob.getMonth() ||
		(today.getMonth() === parsedDob.getMonth() &&
			today.getDate() >= parsedDob.getDate());

	if (!hasBirthdayPassed) {
		age -= 1;
	}

	return age < 0 ? null : age;
};

const toYearsLabel = (value: number | string | null | undefined) => {
	const numeric = Number(value ?? 0);
	if (Number.isNaN(numeric) || numeric < 0) return "N/A";
	return `${numeric} year${numeric === 1 ? "" : "s"}`;
};

export const useMyProfileScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const clerk = useUser();
	const doctorMeQuery = useDoctorMe();

	useEffect(() => {
		if (doctorMeQuery.error) {
			APIErrorHandler()(doctorMeQuery.error);
		}
	}, [APIErrorHandler, doctorMeQuery.error]);

	const profileView = useMemo(() => {
		const doctor = doctorMeQuery.data;
		const profile = doctor?.profile;
		const firstSpecialization = doctor?.specializations?.[0];
		const age = getAge(profile?.dob ?? null);

		return {
			fullName:
				profile?.name?.trim() ||
				clerk.user?.fullName ||
				clerk.user?.primaryEmailAddress?.emailAddress ||
				"Doctor",
			email:
				profile?.email?.trim() ||
				clerk.user?.primaryEmailAddress?.emailAddress ||
				"N/A",
			phone: profile?.mobile_number?.trim() || "N/A",
			age: typeof age === "number" ? `${age} years` : "N/A",
			gender: profile?.gender ? profile.gender : "N/A",
			country: profile?.country?.trim() || "N/A",
			city: profile?.city?.trim() || "N/A",
			address: [profile?.address_line_1, profile?.county, profile?.city]
				.filter(Boolean)
				.join(", "),
			bio: profile?.profile_statement?.trim() || "No bio added yet.",
			license: profile?.medical_registration_number?.trim() || "N/A",
			specialty:
				firstSpecialization?.name?.trim() ||
				profile?.type_of_doctor?.trim() ||
				"N/A",
			currentInstitution: profile?.current_institution?.trim() || "N/A",
			yearsInPractice: toYearsLabel(profile?.years_in_practice),
			experienceYears: toYearsLabel(profile?.years_of_experience),
			specializations: doctor?.specializations ?? [],
			expertises: doctor?.expertises ?? [],
			experiences: doctor?.experiences ?? [],
			applicationStatus: doctor?.application?.status ?? "pending",
			isVerified: Boolean(doctor?.verified),
			avatarUrl: clerk.user?.imageUrl ?? null,
			initials:
				profile?.name
					?.trim()
					.split(/\s+/)
					.slice(0, 2)
					.map((chunk) => chunk.charAt(0).toUpperCase())
					.join("") || "DR",
		};
	}, [clerk.user, doctorMeQuery.data]);

	return {
		title: "My Profile",
		isLoading: doctorMeQuery.isLoading || clerk.isLoaded === false,
		isFetching: doctorMeQuery.isFetching,
		profileView,
	};
};

