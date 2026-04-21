"use client";

import { Card } from "@repo/ui/components/ui/card";

const LoginSection = () => {
	return (
		<div className="flex-1 min-h-screen bg-grey-50 flex flex-col items-center justify-center">
			<Card className="w-full max-w-110 bg-background flex flex-col px-6 py-8 gap-4">
				<p className="font-heading text-2xl font-semibold">
					Doctor Panel Access
				</p>
				<p className="text-muted-foreground text-base">
					Enter the required credentials to access the doctor panel.
				</p>
			</Card>
		</div>
	);
};

export default LoginSection;
