import type { Metadata } from "next";
import { SettingsScreen } from "@/screens/settings-screen";

export const metadata: Metadata = {
	title: "Settings",
	description: "Doctor settings page for Medssi.",
};

const SettingsPage = () => {
	return <SettingsScreen />;
};

export default SettingsPage;

