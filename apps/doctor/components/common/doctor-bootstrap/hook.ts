"use client";

import { DASHBOARD_URL, ONBOARD_URL } from "@/config/client-constants";
import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useDoctorMe } from "@/services/api/doctor/get-me";
import { HttpError } from "@/services/api/http-error";
import { useDoctorStore } from "@/store/doctor.store";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export const useDoctorBootstrap = () => {
	const router = useRouter();
	const pathname = usePathname();
	const { isLoaded, isSignedIn } = useAuth();
	const { APIErrorHandler } = useAPIErrorHandler();
	const { setDoctor } = useDoctorStore();

	const doctorMeQuery = useDoctorMe({
		enabled: isLoaded && Boolean(isSignedIn),
	});

	useEffect(() => {
		if (!isLoaded || !isSignedIn) return;
		if (!doctorMeQuery.isSuccess) return;

		setDoctor(doctorMeQuery.data);
	}, [
		doctorMeQuery.data,
		doctorMeQuery.isSuccess,
		isLoaded,
		isSignedIn,
		setDoctor,
	]);

	useEffect(() => {
		if (!isLoaded || !isSignedIn) return;
		if (!doctorMeQuery.isError) return;

		const err = doctorMeQuery.error;
		if (err instanceof HttpError && err.status === 404) {
			setDoctor(null);
			if (pathname !== ONBOARD_URL) {
				router.replace(ONBOARD_URL);
			}
			return;
		}

		APIErrorHandler()(err);
	}, [
		APIErrorHandler,
		doctorMeQuery.error,
		doctorMeQuery.isError,
		isLoaded,
		isSignedIn,
		pathname,
		router,
		setDoctor,
	]);

	useEffect(() => {
		if (!isLoaded || !isSignedIn) return;
		if (!doctorMeQuery.isSuccess) return;

		const target = doctorMeQuery.data.verified ? DASHBOARD_URL : ONBOARD_URL;

		if (pathname !== target) {
			router.replace(target);
		}
	}, [
		doctorMeQuery.data,
		doctorMeQuery.isSuccess,
		isLoaded,
		isSignedIn,
		pathname,
		router,
	]);

	const shouldShowLoader =
		isLoaded && isSignedIn
			? doctorMeQuery.isLoading || doctorMeQuery.isFetching
			: false;

	return {
		shouldShowLoader,
	};
};

