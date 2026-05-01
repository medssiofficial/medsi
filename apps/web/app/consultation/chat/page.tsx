import type { Metadata } from "next";
import { ConsultationChatScreen } from "@/screens/consultation-chat-screen";

export const metadata: Metadata = {
	title: "Consultation | Medssi",
	description: "Chat with your AI medical assistant.",
};

const ConsultationChatPage = () => {
	return <ConsultationChatScreen />;
};

export default ConsultationChatPage;
