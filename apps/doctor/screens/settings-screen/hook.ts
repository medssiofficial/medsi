"use client";

import { useAppTheme } from "@repo/providers";

export const useSettingsScreen = () => {
	const { theme, resolvedTheme, setTheme } = useAppTheme();

	return {
		title: "Settings",
		description:
			"Account, notification preferences, and app settings will be available here soon.",
		theme: resolvedTheme === "dark" || theme === "dark" ? "dark" : "light",
		setTheme,
	};
};

