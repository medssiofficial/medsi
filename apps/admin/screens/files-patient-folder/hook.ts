"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useTriggerAdminPatientFileProcessMutation } from "@/services/api/admin/files/trigger-patient-file-process";
import { useTriggerAdminPatientFilesProcessBulkMutation } from "@/services/api/admin/files/trigger-patient-files-process-bulk";
import { usePatientFolderDetailQuery } from "@/services/api/admin/files/get-patient-folder-detail";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 12;

export const useFilesPatientFolderScreen = (patientId: string) => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	const processMutation = useTriggerAdminPatientFileProcessMutation();
	const bulkMutation = useTriggerAdminPatientFilesProcessBulkMutation();

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setSearch(searchInput.trim());
			setPage(1);
		}, 350);
		return () => window.clearTimeout(timeoutId);
	}, [searchInput]);

	const detailQuery = usePatientFolderDetailQuery(patientId, {
		page,
		page_size: PAGE_SIZE,
		search,
	});

	useEffect(() => {
		if (!detailQuery.isError) return;
		APIErrorHandler()(detailQuery.error);
	}, [APIErrorHandler, detailQuery.error, detailQuery.isError]);

	useEffect(() => {
		if (!processMutation.isError) return;
		APIErrorHandler()(processMutation.error);
	}, [APIErrorHandler, processMutation.error, processMutation.isError]);

	useEffect(() => {
		if (!bulkMutation.isError) return;
		APIErrorHandler()(bulkMutation.error);
	}, [APIErrorHandler, bulkMutation.error, bulkMutation.isError]);

	const eligibleBulkCount = useMemo(() => {
		const files = detailQuery.data?.files ?? [];
		return files.filter(
			(f) =>
				f.report_type === "text_report" &&
				(f.processing_status === "pending" || f.processing_status === "failed"),
		).length;
	}, [detailQuery.data?.files]);

	const handleProcessTextFile = async (fileId: string) => {
		await processMutation.mutateAsync({ patientId, fileId });
		toast.success("Processing queued.");
	};

	const handleBulkProcessTextFiles = async () => {
		const result = await bulkMutation.mutateAsync({ patientId });
		toast.success(`Queued ${result.queued} file(s).`);
	};

	return {
		detail: detailQuery.data ?? null,
		isLoading: detailQuery.isLoading,
		searchInput,
		setSearchInput,
		page,
		setPage,
		meta: detailQuery.data?.meta ?? {
			total: 0,
			page: 1,
			page_size: PAGE_SIZE,
			total_pages: 1,
			has_next_page: false,
			has_previous_page: false,
		},
		onBulkProcessTextFiles: handleBulkProcessTextFiles,
		onProcessTextFile: handleProcessTextFile,
		isBulkProcessing: bulkMutation.isPending,
		isProcessingFile:
			processMutation.isPending && processMutation.variables
				? processMutation.variables.fileId
				: null,
		eligibleBulkCount,
	};
};
