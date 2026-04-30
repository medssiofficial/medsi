import type { Metadata } from "next";
import { NewConsultationScreen } from "@/screens/new-consultation-screen";

export const metadata: Metadata = {
	title: "New Consultation | Medssi",
	description: "Choose how to start a new consultation.",
};

const NewConsultationPage = () => {
	return <NewConsultationScreen />;
};

export default NewConsultationPage;
