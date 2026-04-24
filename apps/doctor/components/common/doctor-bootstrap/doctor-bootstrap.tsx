"use client";

import { Spinner } from "@repo/ui/components/ui/spinner";
import { useDoctorBootstrap } from "./hook";

export const DoctorBootstrap = () => {
	const { shouldShowLoader } = useDoctorBootstrap();

	if (!shouldShowLoader) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
			<Spinner className="size-6" />
		</div>
	);
};

