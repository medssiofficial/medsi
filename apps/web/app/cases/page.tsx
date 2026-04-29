import type { Metadata } from "next";
import { CasesScreen } from "@/screens/cases-screen";

export const metadata: Metadata = {
	title: "Cases | Medssi",
	description: "Patient cases section.",
};

const CasesPage = () => {
	return <CasesScreen />;
};

export default CasesPage;
