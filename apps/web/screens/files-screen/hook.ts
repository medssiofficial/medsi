"use client";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { usePatientFilesInfinite } from "@/services/api/patient/get-files";
import { useEffect, useMemo, useState } from "react";

export const useFilesScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");

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

	const items = useMemo(
		() => filesQuery.data?.pages.flatMap((page) => page.items) ?? [],
		[filesQuery.data?.pages],
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
	};
};
