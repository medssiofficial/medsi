"use client";

import { ComingSoon, PatientAppShell } from "@/components/common";
import { useDashboardScreen } from "./hook";

const DashboardScreen = () => {
	const screen = useDashboardScreen();

	return (
		<PatientAppShell title="Dashboard">
			<ComingSoon title={screen.title} description={screen.description} />
		</PatientAppShell>
	);
};

export default DashboardScreen;
