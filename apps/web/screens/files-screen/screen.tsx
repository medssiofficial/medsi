"use client";

import { ComingSoon, PatientAppShell } from "@/components/common";
import { useFilesScreen } from "./hook";

const FilesScreen = () => {
	const screen = useFilesScreen();

	return (
		<PatientAppShell title="Files">
			<ComingSoon title={screen.title} description={screen.description} />
		</PatientAppShell>
	);
};

export default FilesScreen;
