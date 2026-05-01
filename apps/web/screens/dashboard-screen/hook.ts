"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { NEW_CONSULTATION_URL } from "@/config/client-constants";
import { usePatientDashboardOverview } from "@/services/api/patient/get-dashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useDashboardScreen = () => {
	const router = useRouter();
	const { APIErrorHandler } = useAPIErrorHandler();
	const dashboardQuery = usePatientDashboardOverview();

	useEffect(() => {
		if (!dashboardQuery.isError) return;
		APIErrorHandler()(dashboardQuery.error);
	}, [APIErrorHandler, dashboardQuery.error, dashboardQuery.isError]);

	const handleStartConsultation = () => {
		router.push(NEW_CONSULTATION_URL);
	};

	return {
		overview: dashboardQuery.data,
		isLoading: dashboardQuery.isLoading,
		isRefreshing: dashboardQuery.isFetching && !dashboardQuery.isLoading,
		handleStartConsultation,
	};
};
