"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { useDashboardScreen } from "./hook";

const DashboardScreen = () => {
	const { title } = useDashboardScreen();

	return (
		<AdminShell>
			<h1 className="text-xl font-semibold">{title}</h1>
		</AdminShell>
	);
};

export default DashboardScreen;

