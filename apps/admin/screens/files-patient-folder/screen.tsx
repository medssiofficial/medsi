"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { useParams } from "next/navigation";
import { PatientFolderContent } from "./components";
import { useFilesPatientFolderScreen } from "./hook";

const FilesPatientFolderScreen = () => {
	const params = useParams<{ patientId: string }>();
	const patientId = String(params?.patientId ?? "");
	const { detail, isLoading, handleSyncProcessing } =
		useFilesPatientFolderScreen(patientId);

	return (
		<AdminShell>
			<PatientFolderContent
				detail={detail}
				isLoading={isLoading}
				onSyncProcessing={handleSyncProcessing}
			/>
		</AdminShell>
	);
};

export default FilesPatientFolderScreen;
