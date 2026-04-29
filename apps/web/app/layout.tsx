import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@repo/providers";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers";
import { PatientBootstrap } from "@/components/common";
import { CLIENT_ENV } from "@/config/client-env";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-space-grotesk",
});

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-manrope",
});

export const metadata: Metadata = {
	title: "Medssi",
	description: "AI-powered medical consultation platform.",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Medssi",
	},
	formatDetection: {
		telephone: false,
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: "#0F6E6E",
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
			<head>
				<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
			</head>
			<body>
				<ClerkProvider
					publishableKey={CLIENT_ENV.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
				>
					<ThemeProvider>
						<QueryProvider>
							<Toaster position="bottom-center" closeButton richColors />
							<PatientBootstrap />
							{children}
						</QueryProvider>
					</ThemeProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
