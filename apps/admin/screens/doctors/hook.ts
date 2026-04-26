"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useApplicationCountsQuery } from "@/services/api/admin/applications/get-application-counts";
import { useAdminDoctorDetailQuery } from "@/services/api/admin/doctors/get-doctor-detail";
import { useAdminDoctorsQuery } from "@/services/api/admin/doctors/get-doctors";
import { useEffect, useState } from "react";

const PAGE_SIZE = 10;

export const useDoctorsScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setSearch(searchInput.trim());
			setPage(1);
		}, 350);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [searchInput]);

	const doctorsQuery = useAdminDoctorsQuery({
		page,
		page_size: PAGE_SIZE,
		search,
		verified: "all",
	});
	const applicationCountsQuery = useApplicationCountsQuery();
	const doctorDetailQuery = useAdminDoctorDetailQuery({
		doctor_id: selectedDoctorId,
		enabled: Boolean(selectedDoctorId),
	});

	useEffect(() => {
		if (!doctorsQuery.isError) return;
		APIErrorHandler()(doctorsQuery.error);
	}, [APIErrorHandler, doctorsQuery.error, doctorsQuery.isError]);

	useEffect(() => {
		if (!applicationCountsQuery.isError) return;
		APIErrorHandler()(applicationCountsQuery.error);
	}, [APIErrorHandler, applicationCountsQuery.error, applicationCountsQuery.isError]);

	useEffect(() => {
		if (!doctorDetailQuery.isError) return;
		APIErrorHandler()(doctorDetailQuery.error);
	}, [APIErrorHandler, doctorDetailQuery.error, doctorDetailQuery.isError]);

	const doctors = doctorsQuery.data?.doctors ?? [];
	const meta = doctorsQuery.data?.meta ?? {
		total: 0,
		page: 1,
		page_size: PAGE_SIZE,
		total_pages: 1,
		has_next_page: false,
		has_previous_page: false,
	};

	return {
		title: "Doctors",
		searchInput,
		setSearchInput,
		page,
		setPage,
		doctors,
		meta,
		pendingApplicationsCount: applicationCountsQuery.data ?? 0,
		selectedDoctorId,
		setSelectedDoctorId,
		selectedDoctor: doctorDetailQuery.data ?? null,
		isDoctorDetailLoading:
			doctorDetailQuery.isLoading || doctorDetailQuery.isFetching,
		isLoading:
			doctorsQuery.isLoading || (doctorsQuery.isFetching && !doctorsQuery.data),
		isRefreshing: doctorsQuery.isFetching,
	};
};

