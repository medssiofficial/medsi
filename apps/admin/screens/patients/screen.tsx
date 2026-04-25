"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { usePatientsScreen } from "./hook";

const PatientsScreen = () => {
	const { title } = usePatientsScreen();

	return (
		<AdminShell>
			<h1 className="text-xl font-semibold">{title}</h1>
		</AdminShell>
	);
};

export default PatientsScreen;

