"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { useAppointmentsScreen } from "./hook";

const AppointmentsScreen = () => {
	const { title } = useAppointmentsScreen();

	return (
		<AdminShell>
			<h1 className="text-xl font-semibold">{title}</h1>
		</AdminShell>
	);
};

export default AppointmentsScreen;

