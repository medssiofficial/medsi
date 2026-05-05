import type { Metadata } from "next";
import { FileProcessingLogsScreen } from "@/screens/settings/file-processing-logs-screen";

export const metadata: Metadata = {
	title: "File processing logs | Medssi",
	description: "History of automated patient file processing runs.",
};

const Page = () => {
	return <FileProcessingLogsScreen />;
};

export default Page;
