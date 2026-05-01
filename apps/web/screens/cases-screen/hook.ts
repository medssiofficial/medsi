"use client";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { NEW_CONSULTATION_URL } from "@/config/client-constants";
import { usePatientCasesInfinite } from "@/services/api/patient/get-cases";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export const useCasesScreen = () => {
	const router = useRouter();
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
		router.push(NEW_CONSULTATION_URL);
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
