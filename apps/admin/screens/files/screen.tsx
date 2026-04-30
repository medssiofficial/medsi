"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { FilesFolderGrid, FilesSubTabs, FilesToolbar } from "./components";
import { useFilesScreen } from "./hook";

const FilesScreen = () => {
	const {
		tab,
		setTab,
		searchInput,
		setSearchInput,
		page,
		setPage,
		items,
		meta,
		isLoading,
		handleSyncProcessing,
	} = useFilesScreen();

	return (
		<AdminShell>
			<div className="space-y-6">
				<FilesSubTabs value={tab} onValueChange={setTab} />
				<FilesToolbar
					searchInput={searchInput}
					onSearchInputChange={setSearchInput}
					onSyncProcessing={handleSyncProcessing}
				/>
				<FilesFolderGrid
					items={items.map((item) =>
						tab === "doctors"
							? {
									id: (item as { doctor_id: string }).doctor_id,
									name: (item as { name: string }).name,
									email: (item as { email: string }).email,
									file_count: (item as { file_count: number }).file_count,
									last_file_at: (item as { last_file_at: string | Date | null }).last_file_at,
									href: `/files/doctors/${(item as { doctor_id: string }).doctor_id}`,
								}
							: {
									id: (item as { user_id: string }).user_id,
									name: (item as { name: string }).name,
									email: (item as { email: string }).email,
									file_count: (item as { file_count: number }).file_count,
									last_file_at: (item as { last_file_at: string | Date | null }).last_file_at,
									href: `/files/patients/${(item as { user_id: string }).user_id}`,
								},
					)}
					isLoading={isLoading}
					page={page}
					totalPages={meta.total_pages}
					hasNextPage={meta.has_next_page}
					hasPreviousPage={meta.has_previous_page}
					onPageChange={setPage}
					onSyncProcessing={handleSyncProcessing}
				/>
			</div>
		</AdminShell>
	);
};

export default FilesScreen;
