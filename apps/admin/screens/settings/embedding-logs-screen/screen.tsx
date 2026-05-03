"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { EmbeddingLogsSection } from "@/screens/settings/components";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

const SettingsEmbeddingLogsScreen = () => {
	return (
		<AdminShell>
			<div className="max-w-4xl space-y-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="font-heading text-2xl font-bold text-foreground">
							Doctor Embedding Logs
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Audit trail for profile embedding jobs (approvals, manual runs, and bulk
							queue).
						</p>
					</div>
					<Button variant="outline" size="sm" className="w-fit" asChild>
						<Link
							href="/settings"
							className="inline-flex items-center gap-2"
						>
							<ArrowLeftIcon className="size-4" />
							Back to settings
						</Link>
					</Button>
				</div>

				<EmbeddingLogsSection presentation="plain" />
			</div>
		</AdminShell>
	);
};

export default SettingsEmbeddingLogsScreen;
