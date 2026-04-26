"use client";

import { AdminShell } from "@/components/common/admin-shell";

const ComingSoonScreen = () => {
	return (
		<AdminShell>
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="rounded-lg border bg-background px-6 py-5 text-center">
					<p className="text-base font-semibold">Coming soon</p>
					<p className="mt-1 text-sm text-muted-foreground">
						This section is under development.
					</p>
				</div>
			</div>
		</AdminShell>
	);
};

export default ComingSoonScreen;
