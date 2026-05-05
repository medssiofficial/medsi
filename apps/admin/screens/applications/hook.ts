"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useApplicationCountsQuery } from "@/services/api/admin/applications/get-application-counts";
import {
	useAdminApplicationsQuery,
	type AdminApplicationStatusFilter,
} from "@/services/api/admin/applications/get-applications";
import { useReviewDoctorApplicationMutation } from "@/services/api/admin/applications/review-application";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DoctorApplicationStatus } from "@repo/database/actions/doctor";

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
	const applicationCountsQuery = useApplicationCountsQuery();

	const reviewMutation = useReviewDoctorApplicationMutation();

	useEffect(() => {
		if (!applicationsQuery.isError) return;
		APIErrorHandler()(applicationsQuery.error);
	}, [APIErrorHandler, applicationsQuery.error, applicationsQuery.isError]);

	useEffect(() => {
		if (!applicationCountsQuery.isError) return;
		APIErrorHandler()(applicationCountsQuery.error);
	}, [APIErrorHandler, applicationCountsQuery.error, applicationCountsQuery.isError]);

	const applications = applicationsQuery.data?.applications ?? [];
	const meta = applicationsQuery.data?.meta ?? {
		total: 0,
		page: 1,
		page_size: PAGE_SIZE,
		total_pages: 1,
		has_next_page: false,
		has_previous_page: false,
	};

	const pendingCount = applicationCountsQuery.data ?? 0;

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

	const handleUpdateApplicationStatus = async (args: {
		application_id: string;
		status: DoctorApplicationStatus;
		rejection_reason?: string;
	}) => {
		try {
			await reviewMutation.mutateAsync({
				application_id: args.application_id,
				status: args.status,
				rejection_reason: args.rejection_reason,
			});
			toast.success("Application status updated.");
			handleCloseReview();
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
		handleUpdateApplicationStatus,
	};
};

