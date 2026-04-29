import type { Metadata } from "next";
import { LoginScreen } from "@/screens/login-screen";

export const metadata: Metadata = {
	title: "Sign In | Medssi",
	description: "Sign in to your Medssi patient account.",
};

const LoginPage = () => {
	return <LoginScreen />;
};

export default LoginPage;
