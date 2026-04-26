"use client";

import { SignUpSection } from "./components";
import { useSignUpScreen } from "./hook";

const SignUpScreen = () => {
	const { title } = useSignUpScreen();

	return <SignUpSection title={title} />;
};

export default SignUpScreen;
