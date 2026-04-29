"use client";

import { ComingSoon, PatientAppShell } from "@/components/common";
import { useChatScreen } from "./hook";

const ChatScreen = () => {
	const screen = useChatScreen();

	return (
		<PatientAppShell title="Chat">
			<ComingSoon title={screen.title} description={screen.description} />
		</PatientAppShell>
	);
};

export default ChatScreen;
