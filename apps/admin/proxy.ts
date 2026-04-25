import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
	ACCESS_DENIED_URL,
	DASHBOARD_URL,
	SIGN_IN_URL,
} from "./config/client-constants";

export const proxy = clerkMiddleware(
	async (auth, req) => {
		const isPublicRoute = createRouteMatcher([
			SIGN_IN_URL,
			ACCESS_DENIED_URL,
			"/api/health",
		]);

		if (!isPublicRoute(req)) {
			await auth.protect();
		}
	},
	() => ({
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

