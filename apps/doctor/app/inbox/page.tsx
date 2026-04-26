import type { Metadata } from "next";
import { InboxScreen } from "@/screens/inbox-screen";

export const metadata: Metadata = {
	title: "Inbox",
	description: "Doctor inbox and notifications page for Medssi.",
};

const InboxPage = () => {
	return <InboxScreen />;
};

export default InboxPage;

