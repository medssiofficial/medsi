"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { usePatientFolderDetailQuery } from "@/services/api/admin/files/get-patient-folder-detail";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 12;

export const useFilesPatientFolderScreen = (patientId: string) => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

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
		handleSyncProcessing: () => {
			toast.success("Sync processing will be available soon.");
		},
	};
};
