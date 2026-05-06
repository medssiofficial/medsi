import type { Metadata } from "next";
import { IntakeQuestionsScreen } from "@/screens/intake-questions";

export const metadata: Metadata = {
	title: "Intake Questions | Admin",
};

const IntakeQuestionsPage = () => {
	return <IntakeQuestionsScreen />;
};

export default IntakeQuestionsPage;
