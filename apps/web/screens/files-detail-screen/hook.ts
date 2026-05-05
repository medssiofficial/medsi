"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { usePatientFileDetailQuery } from "@/services/api/patient/get-file-detail";
import { useTriggerPatientFileProcessMutation } from "@/services/api/patient/trigger-file-process";
import { useEffect } from "react";
import { toast } from "sonner";

export const useFilesDetailScreen = (fileId: string) => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const detailQuery = usePatientFileDetailQuery(fileId);
	const processMutation = useTriggerPatientFileProcessMutation();

	useEffect(() => {
		if (!detailQuery.isError) return;
		APIErrorHandler()(detailQuery.error);
	}, [APIErrorHandler, detailQuery.error, detailQuery.isError]);

	useEffect(() => {
		if (!processMutation.isError) return;
		APIErrorHandler()(processMutation.error);
	}, [APIErrorHandler, processMutation.error, processMutation.isError]);

	const handleProcess = () => {
		const file = detailQuery.data;
		if (!file) return;
		if (file.report_type === "image_report") {
			toast.info("Coming soon.", {
				description: "Image report processing is not available yet.",
			});
			return;
		}
		void processMutation.mutateAsync(fileId).then(() => {
			toast.success("Processing queued.");
		});
	};

	return {
		file: detailQuery.data ?? null,
		isLoading: detailQuery.isLoading,
		handleProcess,
		isProcessing: processMutation.isPending,
	};
};
