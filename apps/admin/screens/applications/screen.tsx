"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { useApplicationsScreen } from "./hook";

const ApplicationsScreen = () => {
	const { title } = useApplicationsScreen();

	return (
		<AdminShell>
			<h1 className="text-xl font-semibold">{title}</h1>
		</AdminShell>
	);
};

export default ApplicationsScreen;

