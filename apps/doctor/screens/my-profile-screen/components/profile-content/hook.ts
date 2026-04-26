"use client";

import { useMemo } from "react";
import type { useMyProfileScreen } from "../../hook";

type ProfileView = ReturnType<typeof useMyProfileScreen>["profileView"];

const getStatusLabel = (status: string) => {
	switch (status) {
		case "approved":
			return "Approved";
		case "rejected":
			return "Rejected";
		case "under_review":
			return "Under Review";
		default:
			return "Pending";
	}
};

export const useProfileContent = (profileView: ProfileView) => {
	const statusTone = useMemo(() => {
		if (profileView.applicationStatus === "approved") {
			return "bg-success/10 text-success";
		}
		if (profileView.applicationStatus === "rejected") {
			return "bg-error/10 text-error";
		}
		if (profileView.applicationStatus === "under_review") {
			return "bg-warning/10 text-warning";
		}
		return "bg-secondary/70 text-secondary-foreground";
	}, [profileView.applicationStatus]);

	return {
		statusLabel: getStatusLabel(profileView.applicationStatus),
		statusTone,
	};
};
