"use client";

import { useCaseDetailQuery } from "@/services/api/patient/get-case-detail";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export const useCaseAnalyzingScreen = () => {
	const router = useRouter();
	const params = useParams();
	const caseId = params.caseId as string;

	const caseDetailQuery = useCaseDetailQuery({ caseId, enabled: Boolean(caseId) });
	const caseData = caseDetailQuery.data;

	useEffect(() => {
		if (caseData?.case_stage === "analyzed" || caseData?.case_stage === "ready_for_matching") {
			router.replace(`/cases/${caseId}/analyzed`);
		}
	}, [caseData?.case_stage, caseId, router]);

	const steps = useMemo(() => {
		if (!caseData) return [];

		const chatComplete = caseData.conversation_status === "completed";
		const filesProcessed = caseData.files.every(
			(f) => f.file.processing_status === "completed" || f.file.processing_status === "not_supported",
		);
		const analysisComplete = caseData.case_stage === "analyzed";

		return [
			{ label: "Symptoms captured", done: chatComplete },
			{ label: "Medical context analyzed", done: filesProcessed },
			{ label: "Structuring your case...", done: analysisComplete },
		];
	}, [caseData]);

	return {
		caseId,
		steps,
		isLoading: caseDetailQuery.isLoading,
		isError: caseDetailQuery.isError,
	};
};
