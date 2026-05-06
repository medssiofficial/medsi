"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CaseDetailContent } from "./components";
import { useMedicalCaseDetailScreen } from "./hook";

const MedicalCaseDetailScreen = () => {
	const { caseId, medicalCase, isLoading, isRefreshing, handleBack } =
		useMedicalCaseDetailScreen();

	return (
		<AdminShell>
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" onClick={handleBack}>
						<ArrowLeft className="size-4" />
					</Button>
					<div className="flex items-center gap-3">
						<h2 className="font-heading text-2xl font-bold text-foreground">
							{isLoading ? (
								<Skeleton className="h-7 w-48" />
							) : (
								`Case #${caseId?.slice(0, 8) ?? ""}`
							)}
						</h2>
						{isRefreshing && (
							<Loader2 className="size-4 animate-spin text-muted-foreground" />
						)}
						{medicalCase?.case_stage === "processing" && (
							<span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-100">
								<Loader2 className="size-3 animate-spin" />
								Processing
							</span>
						)}
					</div>
				</div>

				{isLoading ? (
					<div className="space-y-4">
						<Skeleton className="h-40 w-full" />
						<Skeleton className="h-60 w-full" />
						<Skeleton className="h-40 w-full" />
					</div>
				) : medicalCase ? (
					<CaseDetailContent medicalCase={medicalCase} />
				) : null}
			</div>
		</AdminShell>
	);
};

export default MedicalCaseDetailScreen;
