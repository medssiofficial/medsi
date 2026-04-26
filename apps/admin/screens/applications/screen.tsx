"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { useAdminApplicationDetailQuery } from "@/services/api/admin/applications/get-application-detail";
import { ApplicationReviewSheet, ApplicationsTable, ApplicationsToolbar } from "./components";
import { useApplicationsScreen } from "./hook";

const ApplicationsScreen = () => {
	const {
		searchInput,
		setSearchInput,
		status,
		statusTabs,
		page,
		setPage,
		meta,
		applications,
		pendingCount,
		isLoading,
		isRefreshing,
		isReviewLoading,
		handleStatusChange,
		handleOpenReview,
		handleCloseReview,
		selectedApplicationId,
		isReviewOpen,
		handleApproveApplication,
		handleRejectApplication,
	} = useApplicationsScreen();

	const applicationDetailQuery = useAdminApplicationDetailQuery({
		application_id: selectedApplicationId,
		enabled: isReviewOpen,
	});

	return (
		<AdminShell>
			<div className="space-y-6">
				<ApplicationsToolbar
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					status={status}
					statusTabs={statusTabs}
					onStatusChange={handleStatusChange}
					pendingCount={pendingCount}
				/>

				<ApplicationsTable
					items={applications}
					isLoading={isLoading}
					isRefreshing={isRefreshing}
					page={page}
					pageSize={meta.page_size}
					total={meta.total}
					totalPages={meta.total_pages}
					hasNextPage={meta.has_next_page}
					hasPreviousPage={meta.has_previous_page}
					onPageChange={setPage}
					onReview={handleOpenReview}
				/>
			</div>

			<ApplicationReviewSheet
				open={isReviewOpen}
				onOpenChange={(open) => {
					if (!open) {
						handleCloseReview();
					}
				}}
				application={applicationDetailQuery.data ?? null}
				isLoading={
					applicationDetailQuery.isLoading || applicationDetailQuery.isFetching
				}
				isSubmitting={isReviewLoading}
				onApprove={handleApproveApplication}
				onReject={handleRejectApplication}
			/>
		</AdminShell>
	);
};

export default ApplicationsScreen;

