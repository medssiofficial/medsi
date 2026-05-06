"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { NEW_CONSULTATION_URL } from "@/config/client-constants";
import { usePatientDashboardOverview } from "@/services/api/patient/get-dashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const getCaseRoute = (caseId: string, stage: string) => {
	if (stage === "chatting") return `/consultation/chat?caseId=${caseId}`;
	if (stage === "processing") return `/cases/${caseId}/analyzing`;
	if (stage === "analyzed") return `/cases/${caseId}/analyzed`;
	if (stage === "ready_for_matching") return `/cases/${caseId}/review`;
	return `/consultation/chat?caseId=${caseId}`;
};

export const useDashboardScreen = () => {
	const router = useRouter();
	const { APIErrorHandler } = useAPIErrorHandler();
	const dashboardQuery = usePatientDashboardOverview();

	useEffect(() => {
		if (!dashboardQuery.isError) return;
		APIErrorHandler()(dashboardQuery.error);
	}, [APIErrorHandler, dashboardQuery.error, dashboardQuery.isError]);

	const handleStartConsultation = () => {
		const ongoingCase = dashboardQuery.data?.ongoing_case;
		if (ongoingCase) {
			router.push(getCaseRoute(ongoingCase.id, ongoingCase.case_stage));
			return;
		}
		router.push(NEW_CONSULTATION_URL);
	};

	return {
		overview: dashboardQuery.data,
		isLoading: dashboardQuery.isLoading,
		isRefreshing: dashboardQuery.isFetching && !dashboardQuery.isLoading,
		handleStartConsultation,
	};
};
