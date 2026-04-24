"use client";

import type { DoctorMe } from "@/services/api/doctor/get-me";
import { create } from "zustand";

interface DoctorStoreState {
	doctor: DoctorMe | null;
	setDoctor: (doctor: DoctorMe | null) => void;
}

export const useDoctorStore = create<DoctorStoreState>((set) => ({
	doctor: null,
	setDoctor: (doctor) => set({ doctor }),
}));
