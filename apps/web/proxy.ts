import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
	DASHBOARD_URL,
	PUBLIC_ROUTES,
	SIGN_IN_URL,
	SIGN_UP_URL,
} from "./config/server-constants";
import { serverEnv } from "./config/server-env";

export const proxy = clerkMiddleware(
	async (auth, req) => {
		const isPublicRoute = createRouteMatcher([...PUBLIC_ROUTES]);

		if (
			!isPublicRoute(req) &&
			(req.nextUrl.pathname === SIGN_IN_URL ||
				req.nextUrl.pathname === SIGN_UP_URL)
		) {
			const { userId } = await auth();
			if (userId) {
				return NextResponse.redirect(new URL(DASHBOARD_URL, req.url));
			}
		}

		if (!isPublicRoute(req)) {
			await auth.protect();
		}
	},
	() => ({
		domain: serverEnv.HOST,
		signInUrl: SIGN_IN_URL,
		signUpUrl: SIGN_UP_URL,
		afterSignInUrl: DASHBOARD_URL,
		afterSignUpUrl: DASHBOARD_URL,
	}),
);

export const config = {
	matcher: [
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|sw\\.js|workbox-.*\\.js)).*)",
		"/(api|trpc)(.*)",
	],
};
