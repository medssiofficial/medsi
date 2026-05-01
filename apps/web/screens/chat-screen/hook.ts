"use client";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { usePatientChatsInfinite } from "@/services/api/patient/get-chats";
import { useEffect, useMemo, useState } from "react";

export const useChatScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setSearch(searchInput.trim());
		}, 350);
		return () => window.clearTimeout(timeoutId);
	}, [searchInput]);

	const chatsQuery = usePatientChatsInfinite({ search });

	useEffect(() => {
		if (!chatsQuery.isError) return;
		APIErrorHandler()(chatsQuery.error);
	}, [APIErrorHandler, chatsQuery.error, chatsQuery.isError]);

	const items = useMemo(
		() => chatsQuery.data?.pages.flatMap((page) => page.items) ?? [],
		[chatsQuery.data?.pages],
	);

	const { setSentinelRef } = useInfiniteScroll({
		enabled: true,
		hasNextPage: Boolean(chatsQuery.hasNextPage),
		isFetchingNextPage: chatsQuery.isFetchingNextPage,
		onLoadMore: () => {
			if (!chatsQuery.hasNextPage) return;
			void chatsQuery.fetchNextPage();
		},
	});

	return {
		searchInput,
		setSearchInput,
		items,
		setSentinelRef,
		hasNextPage: Boolean(chatsQuery.hasNextPage),
		isLoading: chatsQuery.isLoading,
		isFetchingNextPage: chatsQuery.isFetchingNextPage,
		isRefreshing: chatsQuery.isFetching && !chatsQuery.isLoading,
		handleLoadMore: () => void chatsQuery.fetchNextPage(),
	};
};
