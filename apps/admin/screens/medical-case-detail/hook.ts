"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useMedicalCaseDetailQuery } from "@/services/api/admin/medical-cases/get-medical-case-detail";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export const useMedicalCaseDetailScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const router = useRouter();
	const params = useParams<{ caseId: string }>();
	const caseId = params.caseId ?? null;

	const detailQuery = useMedicalCaseDetailQuery({
		case_id: caseId,
	});

	useEffect(() => {
		if (!detailQuery.isError) return;
		APIErrorHandler()(detailQuery.error);
	}, [APIErrorHandler, detailQuery.error, detailQuery.isError]);

	const handleBack = () => {
		router.push("/medical-cases");
	};

	return {
		caseId,
		medicalCase: detailQuery.data ?? null,
		isLoading: detailQuery.isLoading,
		isRefreshing: detailQuery.isFetching && !detailQuery.isLoading,
		handleBack,
	};
};
