import type { Metadata } from "next";
import { MyProfileScreen } from "@/screens/my-profile-screen";

export const metadata: Metadata = {
	title: "My Profile",
	description: "Doctor profile page for Medssi.",
};

const MyProfilePage = () => {
	return <MyProfileScreen />;
};

export default MyProfilePage;

