"use client";

import { ComingSoon, DoctorAppShell } from "@/components/common";
import { useMyProfileScreen } from "./hook";

const MyProfileScreen = () => {
	const { title, description } = useMyProfileScreen();

	return (
		<DoctorAppShell title={title}>
			<ComingSoon title={title} description={description} />
		</DoctorAppShell>
	);
};

export default MyProfileScreen;

