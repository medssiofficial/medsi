"use client";

import { SIGN_IN_URL } from "@/config/client-constants";
import { Button } from "@repo/ui/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";

const AccessDeniedScreen = () => {
	return (
		<main className="w-full min-h-screen bg-secondary font-sans flex flex-col items-center justify-center p-8">
			<div className="w-full flex flex-col max-w-90 items-center justify-center gap-4">
				<div className="bg-muted flex items-center justify-center p-5 rounded-full w-fit">
					<Lock className="w-9 h-9 text-muted-foreground" />
				</div>

				<h1 className="text-xl font-heading font-semibold">
					Access Denied
				</h1>

				<p className="text-center">
					You don&apos;t have permission to access the admin dashboard.
					Please contact your administrator if you believe this is an
					error.
				</p>

				<Link href={SIGN_IN_URL}>
					<Button
						variant="outline"
						size="lg"
						className="w-fit rounded-sm cursor-pointer"
					>
						Return to Sign In
					</Button>
				</Link>
			</div>
		</main>
	);
};

export default AccessDeniedScreen;
