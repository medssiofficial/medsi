"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { useParams } from "next/navigation";
import { PatientFolderContent } from "./components";
import { useFilesPatientFolderScreen } from "./hook";

const FilesPatientFolderScreen = () => {
	const params = useParams<{ patientId: string }>();
	const patientId = String(params?.patientId ?? "");
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
		useFilesPatientFolderScreen(patientId);

	return (
		<AdminShell>
			<PatientFolderContent
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

export default FilesPatientFolderScreen;
