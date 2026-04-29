"use client";

import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { OnboardForm } from "./components/onboard-form";
import { useOnboardScreen } from "./hook";

const OnboardScreen = () => {
	const router = useRouter();
	const screen = useOnboardScreen();

	return (
		<div className="min-h-svh bg-neutral-warm pb-6">
			<div className="mx-auto flex w-full max-w-[430px] flex-col pt-safe-top">
				<div className="h-11 px-4">
					<Button
						variant="ghost"
						size="icon-sm"
						type="button"
						onClick={() => router.back()}
						className="text-foreground"
					>
						<ArrowLeftIcon className="size-5" />
					</Button>
				</div>
				<div className="px-6 pb-2">
					<div className="mb-2 h-1 w-full rounded-sm bg-grey-100">
						<div className="h-1 w-1/2 rounded-sm bg-primary" />
					</div>
					<p className="text-xs font-medium text-font-tertiary">Step 1 of 2</p>
				</div>
				<div className="px-6 pb-6 pt-5">
					<div className="mb-5 space-y-1">
						<h1 className="text-[28px] font-bold text-font-primary">{screen.title}</h1>
						<p className="text-sm text-font-secondary">{screen.subtitle}</p>
					</div>
					<OnboardForm />
				</div>
			</div>
		</div>
	);
};

export default OnboardScreen;
