import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { AuthProvider, QueryProvider, ThemeProvider } from "@repo/providers";
import { CLIENT_ENV } from "@/config/client-env";
import { DesktopOnlyGate } from "@repo/ui/components/shells/desktop-only-gate";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-space-grotesk",
});

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-manrope",
});

export const metadata: Metadata = {
	title: "Medssi Doctor",
	description:
		"The doctor's application for managing patient records and appointments.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${spaceGrotesk.variable} ${manrope.variable} h-full antialiased`}
		>
			<body>
				<ThemeProvider>
					<AuthProvider
						publishableKey={
							CLIENT_ENV.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
						}
					>
						<QueryProvider>
							<DesktopOnlyGate>{children}</DesktopOnlyGate>
						</QueryProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
