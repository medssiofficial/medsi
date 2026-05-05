"use client";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { usePatientFilesInfinite } from "@/services/api/patient/get-files";
import { useMemo } from "react";

export const useConsultationChatInput = () => {
	const filesQuery = usePatientFilesInfinite({ search: "" });

	const existingFiles = useMemo(
		() =>
			filesQuery.data?.pages
				.flatMap((page) => page.items)
				.map((f) => ({
					id: f.id,
					filename: f.filename,
					mime_type: f.mime_type,
					public_url: f.public_url,
					processing_status: f.processing_status,
				})) ?? [],
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
		rootMargin: "120px",
	});

	return {
		existingFiles,
		isLoadingFiles: filesQuery.isLoading,
		hasNextPage: Boolean(filesQuery.hasNextPage),
		isFetchingNextPage: filesQuery.isFetchingNextPage,
		loadMore: () => void filesQuery.fetchNextPage(),
		setSentinelRef,
	};
};
