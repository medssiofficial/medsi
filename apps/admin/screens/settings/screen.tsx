"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { useSettingsScreen } from "./hook";

const SettingsScreen = () => {
	const { title } = useSettingsScreen();

	return (
		<AdminShell>
			<h1 className="text-xl font-semibold">{title}</h1>
		</AdminShell>
	);
};

export default SettingsScreen;

