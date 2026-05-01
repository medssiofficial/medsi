"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { useParams } from "next/navigation";
import { DoctorFolderContent } from "./components";
import { useFilesDoctorFolderScreen } from "./hook";

const FilesDoctorFolderScreen = () => {
	const params = useParams<{ doctorId: string }>();
	const doctorId = String(params?.doctorId ?? "");
	const {
		detail,
		isLoading,
		searchInput,
		setSearchInput,
		page,
		setPage,
		meta,
		handleSyncProcessing,
	} =
		useFilesDoctorFolderScreen(doctorId);

	return (
		<AdminShell>
			<DoctorFolderContent
				detail={detail}
				isLoading={isLoading}
				searchInput={searchInput}
				onSearchInputChange={setSearchInput}
				page={page}
				totalPages={meta.total_pages}
				hasNextPage={meta.has_next_page}
				hasPreviousPage={meta.has_previous_page}
				onPageChange={setPage}
				onSyncProcessing={handleSyncProcessing}
			/>
		</AdminShell>
	);
};

export default FilesDoctorFolderScreen;
