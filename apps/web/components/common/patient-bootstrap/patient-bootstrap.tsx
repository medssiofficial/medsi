"use client";

import { SplashScreen } from "@/screens/splash-screen";
import { usePatientBootstrap } from "./hook";

export const PatientBootstrap = () => {
	const { shouldShowSplash } = usePatientBootstrap();

	if (!shouldShowSplash) return null;

	return (
		<div className="fixed inset-0 z-40">
			<SplashScreen />
		</div>
	);
};
