"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

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
			{...rest}
		>
			{children}
		</NextThemesProvider>
	);
};
