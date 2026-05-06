import type { Metadata } from "next";
import { CaseAnalyzingScreen } from "@/screens/case-analyzing-screen";

export const metadata: Metadata = {
	title: "Analyzing Case | Medssi",
};

const CaseAnalyzingPage = () => {
	return <CaseAnalyzingScreen />;
};

export default CaseAnalyzingPage;
