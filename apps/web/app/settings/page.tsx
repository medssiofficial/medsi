import type { Metadata } from "next";
import { SettingsScreen } from "@/screens/settings-screen";

export const metadata: Metadata = {
	title: "Settings | Medssi",
	description: "Patient settings.",
};

const SettingsPage = () => {
	return <SettingsScreen />;
};

export default SettingsPage;
