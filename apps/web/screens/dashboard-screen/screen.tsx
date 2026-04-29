"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

const DashboardScreen = () => {
	return (
		<div className="min-h-svh bg-neutral-warm p-6">
			<Card className="mx-auto w-full max-w-[720px] border border-border-subtle py-5">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-font-primary">
						Patient Dashboard
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-font-secondary">
					Your dashboard modules will be connected in the next step.
				</CardContent>
			</Card>
		</div>
	);
};

export default DashboardScreen;
