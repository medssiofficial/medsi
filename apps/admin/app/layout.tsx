import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { QueryProvider, AuthProvider, ThemeProvider } from "@repo/providers";
import { CLIENT_ENV } from "@/config/client-env";
import { Toaster } from "@repo/ui/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-space-grotesk",
});

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-manrope",
});

export const metadata: Metadata = {
	title: "Medssi Admin",
	description: "Admin Managemnt Console for Medssi Admin",
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
							<Toaster
								position="bottom-right"
								closeButton
								richColors
							/>
							{children}
						</QueryProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
