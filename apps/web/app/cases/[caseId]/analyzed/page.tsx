import type { Metadata } from "next";
import { CaseAnalyzedScreen } from "@/screens/case-analyzed-screen";

export const metadata: Metadata = {
	title: "Case Analysis | Medssi",
};

const CaseAnalyzedPage = () => {
	return <CaseAnalyzedScreen />;
};

export default CaseAnalyzedPage;
