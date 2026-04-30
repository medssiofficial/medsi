"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { usePatientFolderDetailQuery } from "@/services/api/admin/files/get-patient-folder-detail";
import { useEffect } from "react";
import { toast } from "sonner";

export const useFilesPatientFolderScreen = (patientId: string) => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const detailQuery = usePatientFolderDetailQuery(patientId);

	useEffect(() => {
		if (!detailQuery.isError) return;
		APIErrorHandler()(detailQuery.error);
	}, [APIErrorHandler, detailQuery.error, detailQuery.isError]);

	return {
		detail: detailQuery.data ?? null,
		isLoading: detailQuery.isLoading,
		handleSyncProcessing: () => {
			toast.success("Sync processing will be available soon.");
		},
	};
};
