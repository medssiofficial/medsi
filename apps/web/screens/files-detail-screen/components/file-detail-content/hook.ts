"use client";

import type { PatientFileDetail } from "@repo/database/actions/patient";

export const useFileDetailContent = () => {
	const toProcessingTone = (status: PatientFileDetail["processing_status"]) => {
		if (status === "completed") return "bg-emerald-100 text-emerald-800";
		if (status === "failed") return "bg-rose-100 text-rose-800";
		if (status === "processing") return "bg-amber-100 text-amber-800";
		if (status === "not_supported") return "bg-muted text-muted-foreground";
		return "bg-slate-100 text-slate-700";
	};

	return { toProcessingTone };
};
