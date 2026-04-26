"use client";

import { ComingSoon, DoctorAppShell } from "@/components/common";
import { useInboxScreen } from "./hook";

const InboxScreen = () => {
	const { title, description } = useInboxScreen();

	return (
		<DoctorAppShell title={title}>
			<ComingSoon title={title} description={description} />
		</DoctorAppShell>
	);
};

export default InboxScreen;

