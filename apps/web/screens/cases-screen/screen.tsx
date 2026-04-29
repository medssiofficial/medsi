"use client";

import { ComingSoon, PatientAppShell } from "@/components/common";
import { useCasesScreen } from "./hook";

const CasesScreen = () => {
	const screen = useCasesScreen();

	return (
		<PatientAppShell title="Cases">
			<ComingSoon title={screen.title} description={screen.description} />
		</PatientAppShell>
	);
};

export default CasesScreen;
