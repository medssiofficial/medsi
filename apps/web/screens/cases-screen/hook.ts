"use client";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { usePatientCasesInfinite } from "@/services/api/patient/get-cases";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const useCasesScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setSearch(searchInput.trim());
		}, 350);
		return () => window.clearTimeout(timeoutId);
	}, [searchInput]);

	const casesQuery = usePatientCasesInfinite({ search });

	useEffect(() => {
		if (!casesQuery.isError) return;
		APIErrorHandler()(casesQuery.error);
	}, [APIErrorHandler, casesQuery.error, casesQuery.isError]);

	const items = useMemo(
		() => casesQuery.data?.pages.flatMap((page) => page.items) ?? [],
		[casesQuery.data?.pages],
	);

	const { setSentinelRef } = useInfiniteScroll({
		enabled: true,
		hasNextPage: Boolean(casesQuery.hasNextPage),
		isFetchingNextPage: casesQuery.isFetchingNextPage,
		onLoadMore: () => {
			if (!casesQuery.hasNextPage) return;
			void casesQuery.fetchNextPage();
		},
	});

	const handleStartConsultation = () => {
		toast.info("Create new consultation is coming soon.");
	};

	return {
		searchInput,
		setSearchInput,
		items,
		setSentinelRef,
		hasNextPage: Boolean(casesQuery.hasNextPage),
		isLoading: casesQuery.isLoading,
		isFetchingNextPage: casesQuery.isFetchingNextPage,
		isRefreshing: casesQuery.isFetching && !casesQuery.isLoading,
		handleLoadMore: () => void casesQuery.fetchNextPage(),
		handleStartConsultation,
	};
};
