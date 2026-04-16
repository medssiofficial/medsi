"use client";

import { MonitorIcon } from "lucide-react";
import { useIsMobile } from "../ui/use-mobile";
import { MedssiIcon } from "../brand/medssi-icon";
import type { DesktopOnlyGateProps } from "./types";

export function DesktopOnlyGate({
	appName = "This application",
	children,
}: DesktopOnlyGateProps) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-8 text-center">
				<MedssiIcon size="lg" variant="dark" />
				<div className="flex flex-col gap-2">
					<h1 className="font-heading text-xl font-bold text-foreground">
						Desktop Only
					</h1>
					<p className="max-w-xs text-sm text-muted-foreground">
						{appName} is designed for desktop screens. Please switch
						to a device with a larger display.
					</p>
				</div>
				<div className="flex items-center gap-2 text-muted-foreground">
					<MonitorIcon size={18} aria-hidden="true" />
					<span className="text-xs font-medium">
						Minimum 1024px width recommended
					</span>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
