"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useDoctorFoldersQuery } from "@/services/api/admin/files/get-doctor-folders";
import { usePatientFoldersQuery } from "@/services/api/admin/files/get-patient-folders";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 12;

export const useFilesScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [tab, setTab] = useState<"doctors" | "patients">("doctors");
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

	const doctorsQuery = useDoctorFoldersQuery({
		page,
		page_size: PAGE_SIZE,
		search: tab === "doctors" ? search : "",
	});
	const patientsQuery = usePatientFoldersQuery({
		page,
		page_size: PAGE_SIZE,
		search: tab === "patients" ? search : "",
	});

	useEffect(() => {
		if (!doctorsQuery.isError) return;
		APIErrorHandler()(doctorsQuery.error);
	}, [APIErrorHandler, doctorsQuery.error, doctorsQuery.isError]);

	useEffect(() => {
		if (!patientsQuery.isError) return;
		APIErrorHandler()(patientsQuery.error);
	}, [APIErrorHandler, patientsQuery.error, patientsQuery.isError]);

	const activeQuery = tab === "doctors" ? doctorsQuery : patientsQuery;
	const items =
		tab === "doctors"
			? (doctorsQuery.data?.doctors ?? [])
			: (patientsQuery.data?.patients ?? []);
	const meta = activeQuery.data?.meta ?? {
		total: 0,
		page: 1,
		page_size: PAGE_SIZE,
		total_pages: 1,
		has_next_page: false,
		has_previous_page: false,
	};

	return {
		tab,
		setTab: (nextTab: "doctors" | "patients") => {
			setTab(nextTab);
			setPage(1);
			setSearchInput("");
			setSearch("");
		},
		searchInput,
		setSearchInput,
		page,
		setPage,
		items,
		meta,
		isLoading: activeQuery.isLoading,
		isRefreshing: activeQuery.isFetching && !activeQuery.isLoading,
		handleSyncProcessing: () => {
			toast.success("Sync processing will be available soon.");
		},
	};
};
