"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

const ThemeProvider = (
	props: React.ComponentProps<typeof NextThemesProvider>,
) => {
	const { children, ...rest } = props;

	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			storageKey="theme"
			enableSystem
			{...rest}
		>
			{children}
		</NextThemesProvider>
	);
};
