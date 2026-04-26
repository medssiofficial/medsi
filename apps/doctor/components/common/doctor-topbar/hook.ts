"use client";

import { useDoctorStore } from "@/store/doctor.store";
import { useMemo } from "react";

export const useDoctorTopbar = (args: { title: string }) => {
	const { title } = args;
	const doctor = useDoctorStore((state) => state.doctor);

	const subtitle = useMemo(() => {
		const name = doctor?.profile?.name?.trim();
		if (!name) return "Doctor Workspace";
		return `Welcome back, ${name.split(" ")[0] ?? "Doctor"}`;
	}, [doctor?.profile?.name]);

	return {
		title,
		subtitle,
	};
};

