"use client";

import { PatientAppShell } from "@/components/common";
import { DashboardContent } from "./components";
import { useDashboardScreen } from "./hook";

const DashboardScreen = () => {
	const { overview, isLoading, isRefreshing, handleStartConsultation } =
		useDashboardScreen();

	return (
		<PatientAppShell title="Dashboard">
			<DashboardContent
				overview={overview}
				isLoading={isLoading}
				isRefreshing={isRefreshing}
				onStartConsultation={handleStartConsultation}
			/>
		</PatientAppShell>
	);
};

export default DashboardScreen;
