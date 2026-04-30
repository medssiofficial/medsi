import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
	DASHBOARD_URL,
	ONBOARD_URL,
	PUBLIC_ROUTES,
	SIGN_IN_URL,
	SIGN_UP_URL,
	SSO_CALLBACK_URL,
} from "./config/server-constants";
import { serverEnv } from "./config/server-env";

export const proxy = clerkMiddleware(
	async (auth, req) => {
		const isPublicRoute = createRouteMatcher([...PUBLIC_ROUTES]);
		const isAuthRoute = createRouteMatcher([
			SIGN_IN_URL,
			SIGN_UP_URL,
			`${SSO_CALLBACK_URL}(.*)`,
		]);
		const isProtectedAppRoute = createRouteMatcher([DASHBOARD_URL, ONBOARD_URL]);
		const { userId } = await auth();

		if (userId && isAuthRoute(req)) {
			return NextResponse.redirect(new URL(DASHBOARD_URL, req.url));
		}

		if (!userId && isProtectedAppRoute(req)) {
			await auth.protect();
			return;
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
		"/((?!sentry-tunnel|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|sw\\.js|workbox-.*\\.js)).*)",
		"/(api|trpc)(.*)",
	],
};
