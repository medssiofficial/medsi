import type { Metadata } from "next";
import { LandingScreen } from "@/screens/landing-screen";

export const metadata: Metadata = {
	title: "Medssi — Your Health, Simplified",
	description: "AI-powered medical consultation platform.",
};

const HomePage = () => {
	return <LandingScreen />;
};

export default HomePage;
