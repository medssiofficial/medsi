"use client";

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { usePatientFilesInfinite } from "@/services/api/patient/get-files";
import { useUploadPatientFileMutation } from "@/services/api/patient/upload-file";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const useFilesScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const uploadMutation = useUploadPatientFileMutation();

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

	useEffect(() => {
		if (!uploadMutation.isError) return;
		APIErrorHandler()(uploadMutation.error);
	}, [APIErrorHandler, uploadMutation.error, uploadMutation.isError]);

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

	const handleUploadFile = async (file: File) => {
		await uploadMutation.mutateAsync(file);
		toast.success("File uploaded. Processing will start soon.");
	};

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
		handleUploadFile,
		isUploading: uploadMutation.isPending,
	};
};
