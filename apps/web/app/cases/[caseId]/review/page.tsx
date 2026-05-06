import type { Metadata } from "next";
import { CaseReviewScreen } from "@/screens/case-review-screen";

export const metadata: Metadata = {
	title: "Case Review | Medssi",
};

const CaseReviewPage = () => {
	return <CaseReviewScreen />;
};

export default CaseReviewPage;
