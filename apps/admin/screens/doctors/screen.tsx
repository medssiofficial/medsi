"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { DoctorDetailCard, DoctorsTable, DoctorsToolbar } from "./components";
import { useDoctorsScreen } from "./hook";

const DoctorsScreen = () => {
	const {
		searchInput,
		setSearchInput,
		page,
		setPage,
		doctors,
		meta,
		pendingApplicationsCount,
		selectedDoctor,
		setSelectedDoctorId,
		isDoctorDetailLoading,
		isLoading,
		isRefreshing,
		onEmbedDoctor,
		onEmbedMissing,
		isEmbedDoctorLoading,
		embedDoctorId,
		isEmbedBulkLoading,
	} = useDoctorsScreen();

	return (
		<AdminShell>
			<div className="space-y-6">
				<DoctorsToolbar
					totalDoctors={meta.total}
					pendingApplicationsCount={pendingApplicationsCount}
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					onEmbedMissing={onEmbedMissing}
					isEmbedBulkLoading={isEmbedBulkLoading}
				/>
				<DoctorsTable
					items={doctors}
					isLoading={isLoading}
					isRefreshing={isRefreshing}
					page={page}
					pageSize={meta.page_size}
					total={meta.total}
					totalPages={meta.total_pages}
					hasNextPage={meta.has_next_page}
					hasPreviousPage={meta.has_previous_page}
					onPageChange={setPage}
					onViewDoctor={setSelectedDoctorId}
					onEmbedDoctor={onEmbedDoctor}
					isEmbedDoctorLoading={isEmbedDoctorLoading}
					embedDoctorId={embedDoctorId}
				/>
				<DoctorDetailCard
					doctor={selectedDoctor}
					isLoading={isDoctorDetailLoading}
					onEmbedDoctor={onEmbedDoctor}
					isEmbedDoctorLoading={isEmbedDoctorLoading}
					embedDoctorId={embedDoctorId}
				/>
			</div>
		</AdminShell>
	);
};

export default DoctorsScreen;

