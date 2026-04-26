"use client";

import type { AdminApplicationDetail } from "@/services/api/admin/applications/types";
import { useMemo, useState } from "react";

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

export const useApplicationReviewSheet = (args: {
	application: AdminApplicationDetail | null;
	onApprove: (applicationId: string) => Promise<void>;
	onReject: (args: { application_id: string; rejection_reason: string }) => Promise<void>;
}) => {
	const { application, onApprove, onReject } = args;
	const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");
	const [reasonError, setReasonError] = useState<string | null>(null);

	const applicantFields = useMemo(() => {
		if (!application) return [];
		const profile = application.doctor.profile;

		return [
			{ label: "Application ID", value: `#${application.id.slice(-4).toUpperCase()}` },
			{ label: "Doctor ID", value: application.doctor_id },
			{ label: "Name", value: profile?.name ?? "-" },
			{ label: "Email", value: profile?.email ?? "-" },
			{ label: "Mobile", value: profile?.mobile_number ?? "-" },
			{ label: "Country", value: profile?.country ?? "-" },
			{
				label: "Medical Registration Number",
				value: profile?.medical_registration_number ?? "-",
			},
			{
				label: "Current Institution",
				value: profile?.current_institution ?? "-",
			},
			{
				label: "Submitted On",
				value: toReadableDate(application.created_at),
			},
		];
	}, [application]);

	const submittedDocuments = useMemo(() => {
		if (!application) return [];

		const specializationDocs = application.doctor.specializations
			.filter(
				(item) =>
					Boolean(item.certificate_file_key?.trim()) &&
					item.certificate_file_key !== "pending",
			)
			.map((item) => ({
				label: `${item.name} Certificate`,
				file_key: item.certificate_file_key,
				file_name: getFilenameFromStorageKey(item.certificate_file_key),
			}));

		const experienceDocs = application.doctor.experiences
			.filter((item) => Boolean(item.experience_letter_file_key?.trim()))
			.map((item, index) => ({
				label: `Experience Letter ${index + 1}`,
				file_key: item.experience_letter_file_key ?? "",
				file_name: getFilenameFromStorageKey(item.experience_letter_file_key ?? ""),
			}));

		return [...specializationDocs, ...experienceDocs];
	}, [application]);

	const handleApprove = async () => {
		if (!application) return;
		await onApprove(application.id);
	};

	const openRejectDialog = () => {
		setReasonError(null);
		setRejectionReason("");
		setIsRejectDialogOpen(true);
	};

	const handleReject = async () => {
		if (!application) return;
		const reason = rejectionReason.trim();
		if (!reason) {
			setReasonError("Please provide a rejection reason.");
			return;
		}

		await onReject({
			application_id: application.id,
			rejection_reason: reason,
		});
		setIsRejectDialogOpen(false);
		setRejectionReason("");
		setReasonError(null);
	};

	return {
		applicantFields,
		submittedDocuments,
		isRejectDialogOpen,
		setIsRejectDialogOpen,
		rejectionReason,
		setRejectionReason,
		reasonError,
		handleApprove,
		openRejectDialog,
		handleReject,
	};
};
