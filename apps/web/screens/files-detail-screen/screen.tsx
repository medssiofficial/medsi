"use client";

import { PatientAppShell } from "@/components/common";
import { useParams } from "next/navigation";
import { FileDetailContent } from "./components";
import { useFilesDetailScreen } from "./hook";

const FilesDetailScreen = () => {
	const params = useParams<{ fileId: string }>();
	const fileId = String(params?.fileId ?? "");
	const { file, isLoading, handleProcess, isProcessing } = useFilesDetailScreen(fileId);

	return (
		<PatientAppShell title="File details">
			<FileDetailContent
				file={file}
				isLoading={isLoading}
				onProcess={handleProcess}
				isProcessing={isProcessing}
			/>
		</PatientAppShell>
	);
};

export default FilesDetailScreen;
