"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Spinner } from "@repo/ui/components/ui/spinner";
import {
	DASHBOARD_URL,
	ONBOARD_URL,
	SIGN_IN_URL,
} from "@/config/client-constants";

const SSOCallbackPage = () => {
	return (
		<div className="flex min-h-svh items-center justify-center bg-neutral-warm">
			<div className="flex flex-col items-center gap-3">
				<Spinner className="size-6 text-primary" />
				<p className="text-sm text-font-secondary">
					Completing sign-in...
				</p>
			</div>
			<AuthenticateWithRedirectCallback
				signInForceRedirectUrl={DASHBOARD_URL}
				signUpForceRedirectUrl={ONBOARD_URL}
				signInUrl={SIGN_IN_URL}
			/>
			<div id="clerk-captcha" />
		</div>
	);
};

export default SSOCallbackPage;
