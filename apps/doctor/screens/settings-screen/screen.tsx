"use client";

import { ComingSoon, DoctorAppShell } from "@/components/common";
import { useSettingsScreen } from "./hook";

const SettingsScreen = () => {
	const { title, description } = useSettingsScreen();

	return (
		<DoctorAppShell title={title}>
			<ComingSoon title={title} description={description} />
		</DoctorAppShell>
	);
};

export default SettingsScreen;

