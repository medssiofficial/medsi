"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Card } from "@repo/ui/components/ui/card";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { CheckCircle2, Clock3, Mail } from "lucide-react";
import { useUnderReviewScreen } from "./hook";

const UnderReviewScreen = () => {
	const { isLoading, data, applicationId, submittedLabel } = useUnderReviewScreen();

	if (isLoading) {
		return (
			<main className="min-h-screen w-full bg-background text-foreground font-sans flex items-center justify-center">
				<Spinner className="size-6" />
			</main>
		);
	}

	return (
		<main className="min-h-screen w-full bg-muted/40 text-foreground font-sans">
			<header className="w-full border-b border-border bg-background">
				<div className="mx-auto w-full max-w-3xl px-4 py-4 flex items-center justify-between">
					<p className="font-heading text-xl font-semibold">Medssi</p>
					<p className="text-sm text-muted-foreground">Need help?</p>
				</div>
			</header>

			<div className="mx-auto w-full max-w-3xl px-4 py-10">
				<Card className="rounded-2xl border border-border px-8 py-8 flex flex-col gap-6">
					<div className="flex flex-col items-center text-center gap-3">
						<Clock3 className="size-10 text-amber-500" />
						<h1 className="font-heading text-3xl font-bold">
							Your Application is Under Review
						</h1>
						<p className="text-sm text-muted-foreground max-w-xl">
							Our team is verifying your credentials and medical licence. You
							will be notified once approved.
						</p>
					</div>

					<div className="flex flex-col gap-2">
						<p className="font-heading text-base font-semibold">
							Submitted Documents
						</p>
						{(data?.documents ?? []).map((document) => (
							<div
								key={document.key}
								className="h-11 rounded-md border border-border px-3 flex items-center gap-3 bg-background"
							>
								<CheckCircle2 className="size-4 text-emerald-600" />
								<p className="text-sm flex-1">{document.label}</p>
								<Badge
									variant={
										document.status === "uploaded" ? "secondary" : "outline"
									}
								>
									{document.status === "uploaded" ? "Uploaded" : "Missing"}
								</Badge>
							</div>
						))}
					</div>

					<div className="rounded-md border border-border bg-amber-50 px-4 py-3 flex items-center gap-3">
						<Clock3 className="size-4 text-amber-600" />
						<div className="flex flex-col">
							<p className="text-xs font-semibold text-amber-700">
								Expected Review Timeline
							</p>
							<p className="text-sm font-medium text-foreground">
								24-48 business hours from submission
							</p>
						</div>
					</div>

					<div className="rounded-md border border-border bg-muted px-4 py-3 flex items-center gap-3">
						<Mail className="size-4 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							You&apos;ll receive an email once your account is approved and
							activated.
						</p>
					</div>

					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<p>Application ID: {applicationId}</p>
						<p>Submitted {submittedLabel}</p>
					</div>
				</Card>
			</div>
		</main>
	);
};

export default UnderReviewScreen;
