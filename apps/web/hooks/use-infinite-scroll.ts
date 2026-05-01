"use client";

import { useEffect, useRef } from "react";

interface UseInfiniteScrollArgs {
	enabled: boolean;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	onLoadMore: () => void;
	rootMargin?: string;
}

export const useInfiniteScroll = (args: UseInfiniteScrollArgs) => {
	const observerRef = useRef<IntersectionObserver | null>(null);

	const setSentinelRef = (node: HTMLDivElement | null) => {
		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		if (!node || !args.enabled || !args.hasNextPage || args.isFetchingNextPage) {
			return;
		}

		observerRef.current = new IntersectionObserver(
			(entries) => {
				const firstEntry = entries[0];
				if (!firstEntry?.isIntersecting) return;
				args.onLoadMore();
			},
			{
				rootMargin: args.rootMargin ?? "250px",
			},
		);

		observerRef.current.observe(node);
	};

	useEffect(() => {
		return () => observerRef.current?.disconnect();
	}, []);

	return {
		setSentinelRef,
	};
};
