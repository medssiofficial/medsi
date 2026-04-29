import type { Metadata } from "next";
import { SignUpScreen } from "@/screens/sign-up-screen";

export const metadata: Metadata = {
	title: "Create Account | Medssi",
	description: "Create your Medssi patient account.",
};

const SignUpPage = () => {
	return <SignUpScreen />;
};

export default SignUpPage;
