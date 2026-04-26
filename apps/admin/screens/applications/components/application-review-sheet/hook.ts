"use client";

import type { AdminApplicationDetail } from "@/services/api/admin/applications/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DoctorApplicationStatus } from "@repo/database/actions/doctor";

const toReadableDate = (value: Date | string | null | undefined) => {
	if (!value) return "-";
	const date = value instanceof Date ? value : new Date(value);
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
};

const getFilenameFromStorageKey = (value: string) => {
	const parts = value.split("/").filter(Boolean);
	return parts[parts.length - 1] ?? value;
};

const toReadableDateTime = (value: Date | string | null | undefined) => {
	if (!value) return "-";
	const date = value instanceof Date ? value : new Date(value);
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
};

const toTitleCase = (value: string) => {
	return value
		.split("_")
		.filter(Boolean)
		.map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
		.join(" ");
};

const getYearDiff = (startDate: Date | string, endDate: Date | string) => {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const months =
		(end.getFullYear() - start.getFullYear()) * 12 +
		(end.getMonth() - start.getMonth());
	if (months <= 0) return "< 1 month";
	const years = Math.floor(months / 12);
	const remainingMonths = months % 12;
	if (years === 0) return `${remainingMonths} month${remainingMonths === 1 ? "" : "s"}`;
	if (remainingMonths === 0) return `${years} year${years === 1 ? "" : "s"}`;
	return `${years}y ${remainingMonths}m`;
};

const LOCKED_STATUSES = new Set<DoctorApplicationStatus>([
	"approved",
	"rejected",
]);

export interface DocumentItem {
	label: string;
	file_name: string;
	file_key: string;
	file_url: string | null;
	mime_type: string | null;
}

export interface LabelValueItem {
	label: string;
	value: string;
}

export const useApplicationReviewSheet = (args: {
	application: AdminApplicationDetail | null;
	onUpdateStatus: (args: {
		application_id: string;
		status: DoctorApplicationStatus;
		rejection_reason?: string;
	}) => Promise<void>;
}) => {
	const { application, onUpdateStatus } = args;
	const [rejectionReason, setRejectionReason] = useState("");
	const [reasonError, setReasonError] = useState<string | null>(null);
	const [selectedStatus, setSelectedStatus] =
		useState<DoctorApplicationStatus>("pending");
	const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

	const isStatusLocked = application
		? LOCKED_STATUSES.has(application.status)
		: false;

	useEffect(() => {
		if (!application) return;
		setSelectedStatus(application.status);
		setRejectionReason(application.rejection_reason ?? "");
		setReasonError(null);
		setPreviewDoc(null);
	}, [application]);

	const applicantFields = useMemo(() => {
		if (!application) return [];
		const profile = application.doctor.profile;
		const specializations = application.doctor.specializations ?? [];
		const specNames = specializations.map((s) => s.name).filter(Boolean);

		return [
			{ label: "Application ID", value: application.application_code ?? application.id },
			{ label: "Doctor ID", value: application.doctor_id ?? "-" },
			{ label: "Doctor Clerk ID", value: application.doctor.clerk_id ?? "-" },
			{ label: "Application Status", value: toTitleCase(application.status) },
			{
				label: "Doctor Verified",
				value: application.doctor.verified ? "Yes" : "No",
			},
			{ label: "Full Name", value: profile?.name ?? "-" },
			{ label: "Email", value: profile?.email ?? "-" },
			{ label: "Mobile", value: profile?.mobile_number ?? "-" },
			{ label: "Date of Birth", value: toReadableDate(profile?.dob) },
			{ label: "Gender", value: profile?.gender ? toTitleCase(profile.gender) : "-" },
			{ label: "Country", value: profile?.country ?? "-" },
			{ label: "County", value: profile?.county ?? "-" },
			{ label: "City", value: profile?.city ?? "-" },
			{ label: "Address", value: profile?.address_line_1 ?? "-" },
			{
				label: "Medical Registration Number",
				value: profile?.medical_registration_number ?? "-",
			},
			{
				label: "Current Institution",
				value: profile?.current_institution ?? "-",
			},
			{
				label: "Type of Doctor",
				value: profile?.type_of_doctor ?? "-",
			},
			{
				label: "Years in Practice (Profile)",
				value: profile?.years_in_practice
					? `${profile.years_in_practice} years`
					: "-",
			},
			{
				label: "Years of Experience (Profile)",
				value:
					profile?.years_of_experience !== undefined &&
					profile?.years_of_experience !== null
						? `${profile.years_of_experience.toString()} years`
						: "-",
			},
			{
				label: "Specialisation",
				value: specNames.length > 0 ? specNames.join(", ") : "-",
			},
			{
				label: "Website",
				value: profile?.website_url ?? "-",
			},
			{
				label: "LinkedIn",
				value: profile?.linkedin_url ?? "-",
			},
			{ label: "Profile Statement", value: profile?.profile_statement ?? "-" },
			{
				label: "Submitted At",
				value: toReadableDate(
					application.submitted_at ?? application.created_at,
				),
			},
			{
				label: "Created At",
				value: toReadableDateTime(application.created_at),
			},
			{
				label: "Updated At",
				value: toReadableDateTime(application.updated_at),
			},
			{
				label: "Rejection Reason",
				value: application.rejection_reason ?? "-",
			},
		];
	}, [application]);

	const expertiseItems = useMemo(() => {
		if (!application) return [];
		return application.doctor.expertises
			.map((item) => item.expertise?.trim())
			.filter(Boolean) as string[];
	}, [application]);

	const specializationItems = useMemo(() => {
		if (!application) return [];
		return application.doctor.specializations.map((item) => ({
			name: item.name,
			certificate:
				item.certificate_file?.filename ??
				(item.certificate_file_key
					? getFilenameFromStorageKey(item.certificate_file_key)
					: "-"),
		}));
	}, [application]);

	const experienceItems = useMemo(() => {
		if (!application) return [];
		return application.doctor.experiences.map((item) => ({
			hospital: item.hospital_name,
			startDate: toReadableDate(item.start_date),
			endDate: toReadableDate(item.end_date),
			duration: getYearDiff(item.start_date, item.end_date),
			description: item.description ?? "-",
			proof:
				item.experience_letter_file?.filename ??
				(item.experience_letter_file_key
					? getFilenameFromStorageKey(item.experience_letter_file_key)
					: "-"),
		}));
	}, [application]);

	const submittedDocuments: DocumentItem[] = useMemo(() => {
		if (!application) return [];

		const profile = application.doctor.profile;
		const requiredDocs: DocumentItem[] = [
			{
				label: "Medical License",
				file_name: profile?.medical_license_file?.filename ?? "",
				file_key: profile?.medical_license_file?.storage_path ?? "",
				file_url: profile?.medical_license_file?.public_url ?? null,
				mime_type: profile?.medical_license_file?.mime_type ?? null,
			},
			{
				label: "Board Certification",
				file_name: profile?.board_certification_file?.filename ?? "",
				file_key: profile?.board_certification_file?.storage_path ?? "",
				file_url: profile?.board_certification_file?.public_url ?? null,
				mime_type: profile?.board_certification_file?.mime_type ?? null,
			},
			{
				label: "Government ID (Front)",
				file_name: profile?.government_id_front_file?.filename ?? "",
				file_key: profile?.government_id_front_file?.storage_path ?? "",
				file_url: profile?.government_id_front_file?.public_url ?? null,
				mime_type: profile?.government_id_front_file?.mime_type ?? null,
			},
			{
				label: "Government ID (Back)",
				file_name: profile?.government_id_back_file?.filename ?? "",
				file_key: profile?.government_id_back_file?.storage_path ?? "",
				file_url: profile?.government_id_back_file?.public_url ?? null,
				mime_type: profile?.government_id_back_file?.mime_type ?? null,
			},
			{
				label: "Experience Supporting Document",
				file_name: profile?.experience_proof_file?.filename ?? "",
				file_key: profile?.experience_proof_file?.storage_path ?? "",
				file_url: profile?.experience_proof_file?.public_url ?? null,
				mime_type: profile?.experience_proof_file?.mime_type ?? null,
			},
		].filter((item) => Boolean(item.file_key));

		const specializationDocs: DocumentItem[] = application.doctor.specializations
			.filter((item) => Boolean(item.certificate_file?.storage_path?.trim()))
			.map((item) => ({
				label: `${item.name} Supporting Document`,
				file_key: item.certificate_file?.storage_path ?? "",
				file_name:
					item.certificate_file?.filename ??
					getFilenameFromStorageKey(item.certificate_file_key),
				file_url: item.certificate_file?.public_url ?? null,
				mime_type: item.certificate_file?.mime_type ?? null,
			}));

		const experienceDocs: DocumentItem[] = application.doctor.experiences
			.filter((item) => Boolean(item.experience_letter_file_key?.trim()))
			.map((item, index) => ({
				label: `Experience Letter ${index + 1}`,
				file_key: item.experience_letter_file_key ?? "",
				file_name: getFilenameFromStorageKey(
					item.experience_letter_file_key ?? "",
				),
				file_url: item.experience_letter_file?.public_url ?? null,
				mime_type: item.experience_letter_file?.mime_type ?? null,
			}));

		return [...requiredDocs, ...specializationDocs, ...experienceDocs];
	}, [application]);

	const handleApplyStatus = useCallback(async () => {
		if (!application) return;
		if (isStatusLocked) return;
		const reason = rejectionReason.trim();
		if (selectedStatus === "rejected" && !reason) {
			setReasonError("Please provide a rejection reason.");
			return;
		}

		await onUpdateStatus({
			application_id: application.id,
			status: selectedStatus,
			rejection_reason: selectedStatus === "rejected" ? reason : undefined,
		});
	}, [
		application,
		isStatusLocked,
		rejectionReason,
		selectedStatus,
		onUpdateStatus,
	]);

	const handleDocClick = useCallback(
		(doc: DocumentItem) => {
			if (previewDoc?.file_key === doc.file_key) {
				setPreviewDoc(null);
			} else {
				setPreviewDoc(doc);
			}
		},
		[previewDoc],
	);

	return {
		applicantFields,
		expertiseItems,
		specializationItems,
		experienceItems,
		submittedDocuments,
		selectedStatus,
		setSelectedStatus,
		rejectionReason,
		setRejectionReason,
		reasonError,
		handleApplyStatus,
		isStatusLocked,
		previewDoc,
		handleDocClick,
	};
};
