"use client";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useDeletePatientFileMutation } from "@/services/api/patient/delete-file";
import { usePatientFilesInfinite } from "@/services/api/patient/get-files";
import { useTriggerPatientFileProcessMutation } from "@/services/api/patient/trigger-file-process";
import { useTriggerPatientFilesProcessBulkMutation } from "@/services/api/patient/trigger-files-process-bulk";
import { useUploadPatientFileMutation } from "@/services/api/patient/upload-file";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const useFilesScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [viewMode, setViewMode] = useState<"list" | "thumbnail">("list");
	const [activePreviewFile, setActivePreviewFile] = useState<{
		filename: string;
		mime_type: string;
		public_url: string | null;
	} | null>(null);
	const uploadMutation = useUploadPatientFileMutation();
	const processMutation = useTriggerPatientFileProcessMutation();
	const bulkMutation = useTriggerPatientFilesProcessBulkMutation();
	const deleteMutation = useDeletePatientFileMutation();

	useEffect(() => {
		const raw = window.localStorage.getItem("web.files.view_mode");
		if (raw === "list" || raw === "thumbnail") {
			setViewMode(raw);
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem("web.files.view_mode", viewMode);
	}, [viewMode]);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setSearch(searchInput.trim());
		}, 350);
		return () => window.clearTimeout(timeoutId);
	}, [searchInput]);

	const filesQuery = usePatientFilesInfinite({ search });

	useEffect(() => {
		if (!filesQuery.isError) return;
		APIErrorHandler()(filesQuery.error);
	}, [APIErrorHandler, filesQuery.error, filesQuery.isError]);

	useEffect(() => {
		if (!uploadMutation.isError) return;
		APIErrorHandler()(uploadMutation.error);
	}, [APIErrorHandler, uploadMutation.error, uploadMutation.isError]);

	useEffect(() => {
		if (!processMutation.isError) return;
		APIErrorHandler()(processMutation.error);
	}, [APIErrorHandler, processMutation.error, processMutation.isError]);

	useEffect(() => {
		if (!bulkMutation.isError) return;
		APIErrorHandler()(bulkMutation.error);
	}, [APIErrorHandler, bulkMutation.error, bulkMutation.isError]);

	useEffect(() => {
		if (!deleteMutation.isError) return;
		APIErrorHandler()(deleteMutation.error);
	}, [APIErrorHandler, deleteMutation.error, deleteMutation.isError]);

	const items = useMemo(
		() => filesQuery.data?.pages.flatMap((page) => page.items) ?? [],
		[filesQuery.data?.pages],
	);

	const eligibleBulkCount = useMemo(
		() =>
			items.filter(
				(f) =>
					f.report_type === "text_report" &&
					(f.processing_status === "pending" || f.processing_status === "failed"),
			).length,
		[items],
	);

	const { setSentinelRef } = useInfiniteScroll({
		enabled: true,
		hasNextPage: Boolean(filesQuery.hasNextPage),
		isFetchingNextPage: filesQuery.isFetchingNextPage,
		onLoadMore: () => {
			if (!filesQuery.hasNextPage) return;
			void filesQuery.fetchNextPage();
		},
	});

	const handleUploadFile = async (file: File) => {
		await uploadMutation.mutateAsync(file);
		toast.success("File uploaded. Processing will start soon.");
	};

	const handleProcessFile = (fileId: string, reportType: string) => {
		if (reportType === "image_report") {
			toast.info("Coming soon.", {
				description: "Image report processing is not available yet.",
			});
			return;
		}
		void processMutation.mutateAsync(fileId).then(() => {
			toast.success("Processing queued.");
		});
	};

	const handleBulkProcess = () => {
		void bulkMutation.mutateAsync().then((r) => {
			toast.success(`Queued ${r.queued} file(s).`);
		});
	};

	const handleDeleteFile = (fileId: string, filename: string) => {
		const confirmed = window.confirm(`Delete "${filename}"? This cannot be undone.`);
		if (!confirmed) return;

		void deleteMutation.mutateAsync(fileId).then(() => {
			toast.success("File deleted.");
		});
	};

	const handleOpenPreview = (file: {
		filename: string;
		mime_type: string;
		public_url: string | null;
	}) => {
		if (!file.public_url) {
			toast.info("Preview unavailable for this file.");
			return;
		}
		if (file.mime_type.toLowerCase().startsWith("video/")) {
			toast.info("Video preview is not supported yet.");
			return;
		}
		setActivePreviewFile(file);
	};

	return {
		searchInput,
		setSearchInput,
		items,
		setSentinelRef,
		hasNextPage: Boolean(filesQuery.hasNextPage),
		isLoading: filesQuery.isLoading,
		isFetchingNextPage: filesQuery.isFetchingNextPage,
		isRefreshing: filesQuery.isFetching && !filesQuery.isLoading,
		handleLoadMore: () => void filesQuery.fetchNextPage(),
		handleUploadFile,
		isUploading: uploadMutation.isPending,
		onProcessFile: handleProcessFile,
		onBulkProcess: handleBulkProcess,
		isBulkProcessing: bulkMutation.isPending,
		isProcessingFile:
			processMutation.isPending && processMutation.variables
				? processMutation.variables
				: null,
		eligibleBulkCount,
		viewMode,
		setViewMode,
		onDeleteFile: handleDeleteFile,
		isDeletingFile:
			deleteMutation.isPending && deleteMutation.variables
				? deleteMutation.variables
				: null,
		activePreviewFile,
		setActivePreviewFile,
		onOpenPreview: handleOpenPreview,
	};
};
