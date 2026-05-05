"use client";

import {
	APP_TAB_ROUTES,
	DASHBOARD_URL,
	FILES_DETAIL_PREFIX,
	FILES_URL,
	NEW_CONSULTATION_URL,
	ONBOARD_URL,
	SETTINGS_URL,
	SETTINGS_FILE_PROCESSING_LOGS_URL,
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

		const isKnownStaticRoute = [
			...APP_TAB_ROUTES,
			SETTINGS_URL,
			SETTINGS_FILE_PROCESSING_LOGS_URL,
			NEW_CONSULTATION_URL,
		].includes(pathname as typeof DASHBOARD_URL);
		const isFilesDetailRoute = pathname.startsWith(FILES_DETAIL_PREFIX) && pathname !== FILES_URL;
		const isAppRoute = isKnownStaticRoute || isFilesDetailRoute;
		const isAuthOrLandingRoute = pathname === "/" || pathname === SIGN_IN_URL || pathname === SIGN_UP_URL;

		if (!patientMeQuery.data.is_onboarding_complete) {
			if (pathname !== ONBOARD_URL) {
				router.replace(ONBOARD_URL);
			}
			return;
		}

		if (pathname === ONBOARD_URL || isAuthOrLandingRoute) {
			router.replace(DASHBOARD_URL);
			return;
		}

		if (!isAppRoute) {
			router.replace(DASHBOARD_URL);
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
