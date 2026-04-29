"use client";

import { AdminShell } from "@/components/common/admin-shell";
import {
	PatientsKpis,
	PatientsRegistryHeader,
	PatientsTable,
} from "./components";
import { usePatientsScreen } from "./hook";

const PatientsScreen = () => {
	const {
		searchInput,
		setSearchInput,
		page,
		setPage,
		patients,
		meta,
		summary,
		isLoading,
		isRefreshing,
	} = usePatientsScreen();

	return (
		<AdminShell>
			<div className="space-y-6">
				<PatientsRegistryHeader
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
				/>

				<PatientsKpis summary={summary} isLoading={isLoading && !summary} />

				<PatientsTable
					items={patients}
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

export default PatientsScreen;
