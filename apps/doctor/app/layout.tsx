import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@repo/providers";
import { ClerkProvider } from "@clerk/nextjs";
import { DesktopOnlyGate } from "@repo/ui/components/shells/desktop-only-gate";
import { Toaster } from "@/components/ui/sonner";
import { DoctorBootstrap } from "@/components/common";
import { QueryProvider } from "@/components/providers";

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
			suppressHydrationWarning
			className={`${spaceGrotesk.variable} ${manrope.variable} h-full antialiased`}
		>
			<body>
				<ClerkProvider>
					<ThemeProvider>
						<QueryProvider>
							<DesktopOnlyGate>
								<Toaster
									position="bottom-right"
									closeButton
									richColors
								/>
								<DoctorBootstrap />
								{children}
							</DesktopOnlyGate>
						</QueryProvider>
					</ThemeProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
