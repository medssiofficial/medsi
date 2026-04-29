import type { Metadata } from "next";
import { FilesScreen } from "@/screens/files-screen";

export const metadata: Metadata = {
	title: "Files | Medssi",
	description: "Patient files section.",
};

const FilesPage = () => {
	return <FilesScreen />;
};

export default FilesPage;
