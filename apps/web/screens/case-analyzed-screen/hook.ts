"use client";

import { useCaseDetailQuery } from "@/services/api/patient/get-case-detail";
import { useParams, useRouter } from "next/navigation";

export const useCaseAnalyzedScreen = () => {
	const router = useRouter();
	const params = useParams();
	const caseId = params.caseId as string;

	const caseDetailQuery = useCaseDetailQuery({ caseId, enabled: Boolean(caseId) });
	const caseData = caseDetailQuery.data;
	const analysis = caseData?.analysis ?? null;

	const handleContinueToReview = () => {
		router.push(`/cases/${caseId}/review`);
	};

	const handleGoBack = () => {
		router.back();
	};

	return {
		caseId,
		caseData,
		analysis,
		isLoading: caseDetailQuery.isLoading,
		isError: caseDetailQuery.isError,
		handleContinueToReview,
		handleGoBack,
	};
};
