import type { Metadata } from "next";
import { ProfileScreen } from "@/screens/profile-screen";

export const metadata: Metadata = {
	title: "Profile | Medssi",
	description: "Patient profile.",
};

const ProfilePage = () => {
	return <ProfileScreen />;
};

export default ProfilePage;
