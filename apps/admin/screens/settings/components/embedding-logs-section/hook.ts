"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useAdminEmbeddingLogsQuery } from "@/services/api/admin/embedding/get-embedding-logs";
import { useEffect, useState } from "react";

const PAGE_SIZE = 15;

export const useEmbeddingLogsSection = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [page, setPage] = useState(1);

	const query = useAdminEmbeddingLogsQuery({
		page,
		page_size: PAGE_SIZE,
	});

	useEffect(() => {
		if (!query.isError) return;
		APIErrorHandler()(query.error);
	}, [APIErrorHandler, query.error, query.isError]);

	const items = query.data?.items ?? [];
	const meta = query.data?.meta ?? {
		total: 0,
		page: 1,
		page_size: PAGE_SIZE,
		total_pages: 1,
		has_next_page: false,
		has_previous_page: false,
	};

	return {
		items,
		meta,
		page,
		setPage,
		isLoading: query.isLoading || (query.isFetching && !query.data),
		isRefreshing: query.isFetching,
	};
};
