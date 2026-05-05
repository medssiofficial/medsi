"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { MedicalCasesTable, MedicalCasesToolbar } from "./components";
import { useMedicalCasesScreen } from "./hook";

const MedicalCasesScreen = () => {
	const {
		searchInput,
		setSearchInput,
		stage,
		setStage,
		status,
		setStatus,
		page,
		setPage,
		cases,
		meta,
		isLoading,
		isRefreshing,
	} = useMedicalCasesScreen();

	return (
		<AdminShell>
			<div className="space-y-6">
				<MedicalCasesToolbar
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					stage={stage}
					onStageChange={setStage}
					status={status}
					onStatusChange={setStatus}
				/>

				<MedicalCasesTable
					items={cases}
					isLoading={isLoading}
					isRefreshing={isRefreshing}
					page={page}
					pageSize={meta.page_size}
					total={meta.total}
					totalPages={meta.total_pages}
					hasNextPage={meta.has_next_page}
					hasPreviousPage={meta.has_previous_page}
					onPageChange={setPage}
				/>
			</div>
		</AdminShell>
	);
};

export default MedicalCasesScreen;
