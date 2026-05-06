import type { Metadata } from "next";
import { MedicalCaseDetailScreen } from "@/screens/medical-case-detail";

export const metadata: Metadata = {
	title: "Case Detail | Admin",
};

const MedicalCaseDetailPage = () => {
	return <MedicalCaseDetailScreen />;
};

export default MedicalCaseDetailPage;
