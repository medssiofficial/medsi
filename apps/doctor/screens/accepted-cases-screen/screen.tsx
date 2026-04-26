"use client";

import { ComingSoon, DoctorAppShell } from "@/components/common";
import { useAcceptedCasesScreen } from "./hook";

const AcceptedCasesScreen = () => {
	const { title, description } = useAcceptedCasesScreen();

	return (
		<DoctorAppShell title={title}>
			<ComingSoon title={title} description={description} />
		</DoctorAppShell>
	);
};

export default AcceptedCasesScreen;

