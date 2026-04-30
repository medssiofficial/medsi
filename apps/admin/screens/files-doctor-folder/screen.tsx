"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { useParams } from "next/navigation";
import { DoctorFolderContent } from "./components";
import { useFilesDoctorFolderScreen } from "./hook";

const FilesDoctorFolderScreen = () => {
	const params = useParams<{ doctorId: string }>();
	const doctorId = String(params?.doctorId ?? "");
	const { detail, isLoading, handleSyncProcessing } =
		useFilesDoctorFolderScreen(doctorId);

	return (
		<AdminShell>
			<DoctorFolderContent
				detail={detail}
				isLoading={isLoading}
				onSyncProcessing={handleSyncProcessing}
			/>
		</AdminShell>
	);
};

export default FilesDoctorFolderScreen;
