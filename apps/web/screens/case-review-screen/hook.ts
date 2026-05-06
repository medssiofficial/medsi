"use client";

import { useCaseDetailQuery } from "@/services/api/patient/get-case-detail";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const useCaseReviewScreen = () => {
	const router = useRouter();
	const params = useParams();
	const caseId = params.caseId as string;

	const caseDetailQuery = useCaseDetailQuery({ caseId, enabled: Boolean(caseId) });
	const caseData = caseDetailQuery.data;
	const analysis = caseData?.analysis ?? null;

	const [expandedSections, setExpandedSections] = useState<string[]>(["symptoms"]);

	const toggleSection = (section: string) => {
		setExpandedSections((prev) =>
			prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
		);
	};

	const collectedInfo = useMemo(() => {
		if (!analysis?.collected_information) return null;
		const info = analysis.collected_information as Record<string, unknown>;
		return {
			symptoms: (info.symptoms as string[]) ?? [],
			medical_history: (info.medical_history as string[]) ?? [],
			medications: (info.medications as string[]) ?? [],
			allergies: (info.allergies as string[]) ?? [],
		};
	}, [analysis?.collected_information]);

	const dimensionScores = useMemo(() => {
		if (!analysis?.collected_information) return [];
		const info = analysis.collected_information as Record<string, unknown>;
		const scores = info.dimension_scores as Record<string, number> | undefined;
		if (!scores) return [];
		return Object.entries(scores).map(([label, value]) => ({ label, value: value as number }));
	}, [analysis?.collected_information]);

	const handleContinueToMatching = () => {
		toast.info("Coming soon");
	};

	const handleGoBack = () => {
		router.back();
	};

	return {
		caseId,
		caseData,
		analysis,
		collectedInfo,
		dimensionScores,
		expandedSections,
		toggleSection,
		isLoading: caseDetailQuery.isLoading,
		handleContinueToMatching,
		handleGoBack,
	};
};
