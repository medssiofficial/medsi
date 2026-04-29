"use client";

import {
	DASHBOARD_URL,
	ONBOARD_URL,
	SIGN_IN_URL,
	SIGN_UP_URL,
} from "@/config/client-constants";
import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { usePatientMe } from "@/services/api/patient/get-me";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export const usePatientBootstrap = () => {
	const router = useRouter();
	const pathname = usePathname();
	const { isLoaded, isSignedIn } = useAuth();
	const { APIErrorHandler } = useAPIErrorHandler();

	const patientMeQuery = usePatientMe({
		enabled: isLoaded && Boolean(isSignedIn),
	});

	useEffect(() => {
		if (!isLoaded || !isSignedIn) return;
		if (!patientMeQuery.isError) return;

		APIErrorHandler()(patientMeQuery.error);
	}, [APIErrorHandler, isLoaded, isSignedIn, patientMeQuery.error, patientMeQuery.isError]);

	useEffect(() => {
		if (!isLoaded || !isSignedIn) return;
		if (!patientMeQuery.isSuccess) return;

		const target = patientMeQuery.data.is_onboarding_complete
			? DASHBOARD_URL
			: ONBOARD_URL;

		if (pathname !== target) {
			router.replace(target);
		}
	}, [isLoaded, isSignedIn, pathname, patientMeQuery.data, patientMeQuery.isSuccess, router]);

	const isAuthRoute = pathname === SIGN_IN_URL || pathname === SIGN_UP_URL;
	const shouldShowSplash = isLoaded && isSignedIn
		? (patientMeQuery.isLoading || (isAuthRoute && patientMeQuery.isFetching))
		: false;

	return {
		shouldShowSplash,
	};
};
