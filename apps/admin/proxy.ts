import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
	ACCESS_DENIED_URL,
	DASHBOARD_URL,
	SIGN_IN_URL,
} from "./config/client-constants";
import { SERVER_ENV } from "./config/server-env";

export const proxy = clerkMiddleware(
	async (auth, req) => {
		const { userId } = await auth();
		const isPublicRoute = createRouteMatcher([
			SIGN_IN_URL,
			ACCESS_DENIED_URL,
			"/api/health",
		]);

		if (userId && (req.nextUrl.pathname === SIGN_IN_URL || req.nextUrl.pathname === ACCESS_DENIED_URL)) {
			return NextResponse.redirect(new URL(DASHBOARD_URL, req.url));
		}

		if (!isPublicRoute(req)) {
			await auth.protect();
		}
	},
	() => ({
		domain: SERVER_ENV.HOST,
		signInUrl: SIGN_IN_URL,
		afterSignInUrl: DASHBOARD_URL,
	}),
);

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		"/(api|trpc)(.*)",
	],
};
