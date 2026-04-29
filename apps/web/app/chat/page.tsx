import type { Metadata } from "next";
import { ChatScreen } from "@/screens/chat-screen";

export const metadata: Metadata = {
	title: "Chat | Medssi",
	description: "Patient chat section.",
};

const ChatPage = () => {
	return <ChatScreen />;
};

export default ChatPage;
