"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { useDoctorsScreen } from "./hook";

const DoctorsScreen = () => {
	const { title } = useDoctorsScreen();

	return (
		<AdminShell>
			<h1 className="text-xl font-semibold">{title}</h1>
		</AdminShell>
	);
};

export default DoctorsScreen;

