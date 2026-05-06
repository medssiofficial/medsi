import type { Metadata } from "next";
import { ChatDetailScreen } from "@/screens/chat-detail-screen";

export const metadata: Metadata = {
	title: "Chat Detail | Medssi",
};

const ChatDetailPage = () => {
	return <ChatDetailScreen />;
};

export default ChatDetailPage;
