"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useAdminPatientsQuery } from "@/services/api/admin/patients/get-patients";
import { useEffect, useState } from "react";

const PAGE_SIZE = 10;

export const usePatientsScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setSearch(searchInput.trim());
			setPage(1);
		}, 350);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [searchInput]);

	const patientsQuery = useAdminPatientsQuery({
		page,
		page_size: PAGE_SIZE,
		search,
	});

	useEffect(() => {
		if (!patientsQuery.isError) return;
		APIErrorHandler()(patientsQuery.error);
	}, [APIErrorHandler, patientsQuery.error, patientsQuery.isError]);

	const patients = patientsQuery.data?.patients ?? [];
	const meta = patientsQuery.data?.meta ?? {
		total: 0,
		page: 1,
		page_size: PAGE_SIZE,
		total_pages: 1,
		has_next_page: false,
		has_previous_page: false,
	};
	const summary = patientsQuery.data?.summary ?? null;

	return {
		searchInput,
		setSearchInput,
		page,
		setPage,
		patients,
		meta,
		summary,
		isLoading: patientsQuery.isLoading,
		isRefreshing: patientsQuery.isFetching && !patientsQuery.isLoading,
	};
};
