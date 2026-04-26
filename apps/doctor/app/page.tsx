import type { Metadata } from "next";
import { DashboardScreen } from "@/screens/dashboard-screen";

export const metadata: Metadata = {
	title: "Doctor Dashboard",
	description: "Doctor workspace dashboard for Medssi.",
};

const HomePage = () => {
	return <DashboardScreen />;
};

export default HomePage;

