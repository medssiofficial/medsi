"use client";

import { ComingSoon, DoctorAppShell } from "@/components/common";
import { useDashboardScreen } from "./hook";

const DashboardScreen = () => {
	const { title, description } = useDashboardScreen();

	return (
		<DoctorAppShell title={title}>
			<ComingSoon title={title} description={description} />
		</DoctorAppShell>
	);
};

export default DashboardScreen;

