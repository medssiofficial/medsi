import type { Metadata } from "next";
import { AcceptedCasesScreen } from "@/screens/accepted-cases-screen";

export const metadata: Metadata = {
	title: "Accepted Cases",
	description: "Doctor accepted cases page for Medssi.",
};

const AcceptedCasesPage = () => {
	return <AcceptedCasesScreen />;
};

export default AcceptedCasesPage;

