"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { usePatientDashboardOverview } from "@/services/api/patient/get-dashboard";
import { useEffect } from "react";
import { toast } from "sonner";

export const useDashboardScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const dashboardQuery = usePatientDashboardOverview();

	useEffect(() => {
		if (!dashboardQuery.isError) return;
		APIErrorHandler()(dashboardQuery.error);
	}, [APIErrorHandler, dashboardQuery.error, dashboardQuery.isError]);

	const handleStartConsultation = () => {
		toast.info("Start new consultation is coming soon.");
	};

	return {
		overview: dashboardQuery.data,
		isLoading: dashboardQuery.isLoading,
		isRefreshing: dashboardQuery.isFetching && !dashboardQuery.isLoading,
		handleStartConsultation,
	};
};
