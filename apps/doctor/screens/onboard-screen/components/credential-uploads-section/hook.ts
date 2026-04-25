"use client";

import type { DoctorMe } from "@/services/api/doctor/get-me";
import { useMemo } from "react";

export const useCredentialUploadsSection = (args: { doctor: DoctorMe | null }) => {
	const { doctor } = args;

	const items = useMemo(() => {
		const specializations = doctor?.specializations ?? [];

		if (!specializations.length) {
			return [
				{
					label: "Specialisation Certificate",
					progress: 0,
					status: "Not started",
				},
			];
		}

		return specializations.map((s) => {
			const hasKey =
				Boolean(s.certificate_file_key?.trim()) && s.certificate_file_key !== "pending";
			return {
				label: `${s.name} Certificate`,
				progress: hasKey ? 100 : 0,
				status: hasKey ? "Uploaded" : "Not started",
			};
		});
	}, [doctor?.specializations]);

	return {
		items,
	};
};
