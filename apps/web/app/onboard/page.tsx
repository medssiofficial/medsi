import type { Metadata } from "next";
import { OnboardScreen } from "@/screens/onboard-screen";

export const metadata: Metadata = {
	title: "Onboarding | Medssi",
	description: "Complete your Medssi patient profile.",
};

const OnboardPage = () => {
	return <OnboardScreen />;
};

export default OnboardPage;
