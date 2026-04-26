"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import {
	useAdminApplicationsQuery,
	type AdminApplicationStatusFilter,
} from "@/services/api/admin/applications/get-applications";
import { useReviewDoctorApplicationMutation } from "@/services/api/admin/applications/review-application";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export const useApplicationsScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<AdminApplicationStatusFilter>("all");
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [selectedApplicationId, setSelectedApplicationId] = useState<
		string | null
	>(null);
	const [isReviewOpen, setIsReviewOpen] = useState(false);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setSearch(searchInput.trim());
			setPage(1);
		}, 350);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [searchInput]);

	const applicationsQuery = useAdminApplicationsQuery({
		page,
		page_size: PAGE_SIZE,
		search,
		status,
	});

	const reviewMutation = useReviewDoctorApplicationMutation();

	useEffect(() => {
		if (!applicationsQuery.isError) return;
		APIErrorHandler()(applicationsQuery.error);
	}, [APIErrorHandler, applicationsQuery.error, applicationsQuery.isError]);

	const applications = applicationsQuery.data?.applications ?? [];
	const meta = applicationsQuery.data?.meta ?? {
		total: 0,
		page: 1,
		page_size: PAGE_SIZE,
		total_pages: 1,
		has_next_page: false,
		has_previous_page: false,
	};

	const pendingCount = useMemo(
		() =>
			applications.filter(
				(item) =>
					item.status === "pending" || item.status === "under_review",
			).length,
		[applications],
	);

	const handleStatusChange = (nextStatus: AdminApplicationStatusFilter) => {
		setStatus(nextStatus);
		setPage(1);
	};

	const handleOpenReview = (applicationId: string) => {
		setSelectedApplicationId(applicationId);
		setIsReviewOpen(true);
	};

	const handleCloseReview = () => {
		setIsReviewOpen(false);
		setSelectedApplicationId(null);
	};

	const handleApproveApplication = async (applicationId: string) => {
		try {
			await reviewMutation.mutateAsync({
				application_id: applicationId,
				action: "approve",
			});
			toast.success("Application approved.");
		} catch (error) {
			APIErrorHandler()(error);
		}
	};

	const handleRejectApplication = async (args: {
		application_id: string;
		rejection_reason: string;
	}) => {
		try {
			await reviewMutation.mutateAsync({
				application_id: args.application_id,
				action: "reject",
				rejection_reason: args.rejection_reason,
			});
			toast.success("Application rejected.");
		} catch (error) {
			APIErrorHandler()(error);
		}
	};

	const statusTabs: Array<{
		value: AdminApplicationStatusFilter;
		label: string;
	}> = [
		{ value: "all", label: "All" },
		{ value: "pending", label: "Pending" },
		{ value: "under_review", label: "Under Review" },
		{ value: "approved", label: "Approved" },
		{ value: "rejected", label: "Rejected" },
	];

	return {
		title: "Applications",
		searchInput,
		setSearchInput,
		status,
		statusTabs,
		page,
		setPage,
		meta,
		applications,
		pendingCount,
		isLoading:
			applicationsQuery.isLoading ||
			(applicationsQuery.isFetching && !applicationsQuery.data),
		isRefreshing: applicationsQuery.isFetching,
		isReviewLoading: reviewMutation.isPending,
		handleStatusChange,
		handleOpenReview,
		handleCloseReview,
		selectedApplicationId,
		isReviewOpen,
		handleApproveApplication,
		handleRejectApplication,
	};
};

