"use client";

import { LoginSection } from "./components";
import { useLoginScreen } from "./hook";

const LoginScreen = () => {
	const { title } = useLoginScreen();

	return <LoginSection title={title} />;
};

export default LoginScreen;
