"use client";

import { useAppTheme } from "@repo/providers";

export const useSettingsScreen = () => {
	const { theme, resolvedTheme, setTheme } = useAppTheme();

	return {
		title: "Settings",
		theme: resolvedTheme === "dark" || theme === "dark" ? "dark" : "light",
		setTheme,
	};
};

