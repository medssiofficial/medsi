import type { Metadata } from "next";
import { DashboardScreen } from "@/screens/dashboard-screen";

export const metadata: Metadata = {
	title: "Dashboard | Medssi",
	description: "Patient dashboard for Medssi.",
};

const DashboardPage = () => {
	return <DashboardScreen />;
};

export default DashboardPage;
