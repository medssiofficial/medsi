"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme } from "next-themes";

export const useAppTheme = useTheme;

export const ThemeProvider = (
	props: React.ComponentProps<typeof NextThemesProvider>,
) => {
	const { children, ...rest } = props;

	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="light"
			storageKey="theme"
			enableSystem={false}
			disableTransitionOnChange
			{...rest}
		>
			{children}
		</NextThemesProvider>
	);
};
