"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useMedicalCasesQuery } from "@/services/api/admin/medical-cases/get-medical-cases";
import { useEffect, useState } from "react";

const PAGE_SIZE = 20;

export const useMedicalCasesScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [stage, setStageState] = useState("all");
	const [status, setStatusState] = useState("all");

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setSearch(searchInput.trim());
			setPage(1);
		}, 350);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [searchInput]);

	const setStage = (value: string) => {
		setStageState(value);
		setPage(1);
	};

	const setStatus = (value: string) => {
		setStatusState(value);
		setPage(1);
	};

	const casesQuery = useMedicalCasesQuery({
		page,
		page_size: PAGE_SIZE,
		search: search || undefined,
		stage: stage === "all" ? undefined : stage,
		status: status === "all" ? undefined : status,
	});

	useEffect(() => {
		if (!casesQuery.isError) return;
		APIErrorHandler()(casesQuery.error);
	}, [APIErrorHandler, casesQuery.error, casesQuery.isError]);

	const cases = casesQuery.data?.cases ?? [];
	const meta = casesQuery.data?.meta ?? {
		total: 0,
		page: 1,
		page_size: PAGE_SIZE,
		total_pages: 1,
		has_next_page: false,
		has_previous_page: false,
	};

	return {
		searchInput,
		setSearchInput,
		stage,
		setStage,
		status,
		setStatus,
		page,
		setPage,
		cases,
		meta,
		isLoading: casesQuery.isLoading,
		isRefreshing: casesQuery.isFetching && !casesQuery.isLoading,
	};
};
