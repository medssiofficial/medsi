"use client";

import type { DoctorDetail } from "@/services/api/admin/doctors/get-doctor-detail";

const formatDate = (value?: string | Date | null) => {
	if (!value) return "-";
	const date = value instanceof Date ? value : new Date(value);
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
};

const formatDoctorType = (value?: string | null) => {
	if (!value) return "-";
	return value
		.split("_")
		.map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
		.join(" ");
};

export const useDoctorDetail = (args: { doctor: DoctorDetail | null }) => {
	const { doctor } = args;

	const leftFields = [
		{ label: "Name", value: doctor?.profile?.name ?? "-" },
		{ label: "Email", value: doctor?.profile?.email ?? "-" },
		{ label: "Mobile", value: doctor?.profile?.mobile_number ?? "-" },
		{ label: "Medical ID", value: doctor?.profile?.medical_registration_number ?? "-" },
	];

	const rightFields = [
		{ label: "Location", value: doctor?.profile?.city || doctor?.profile?.country || "-" },
		{ label: "Years in Practice", value: `${doctor?.profile?.years_in_practice ?? "-"}` },
		{ label: "Work Setup", value: formatDoctorType(doctor?.profile?.type_of_doctor) },
		{ label: "Joined", value: formatDate(doctor?.created_at) },
	];

	const docs = [
		...(doctor?.specializations ?? [])
			.filter((item) => item.certificate_file_key !== "pending")
			.map((item) => ({
				label: `${item.name} Certificate`,
				value: item.certificate_file_key,
			})),
		...(doctor?.experiences ?? [])
			.filter((item) => Boolean(item.experience_letter_file_key))
			.map((item, index) => ({
				label: `Experience Letter ${index + 1}`,
				value: item.experience_letter_file_key ?? "",
			})),
	];

	return {
		leftFields,
		rightFields,
		docs,
	};
};
