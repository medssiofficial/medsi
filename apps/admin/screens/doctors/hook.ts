"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useApplicationCountsQuery } from "@/services/api/admin/applications/get-application-counts";
import { useAdminDoctorDetailQuery } from "@/services/api/admin/doctors/get-doctor-detail";
import { useAdminDoctorsQuery } from "@/services/api/admin/doctors/get-doctors";
import { useTriggerDoctorEmbedBulkMutation } from "@/services/api/admin/doctors/trigger-embed-bulk";
import { useTriggerDoctorEmbedMutation } from "@/services/api/admin/doctors/trigger-doctor-embed";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
	const embedMutation = useTriggerDoctorEmbedMutation();
	const embedBulkMutation = useTriggerDoctorEmbedBulkMutation();

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

	useEffect(() => {
		if (!embedMutation.isError) return;
		APIErrorHandler()(embedMutation.error);
	}, [APIErrorHandler, embedMutation.error, embedMutation.isError]);

	useEffect(() => {
		if (!embedBulkMutation.isError) return;
		APIErrorHandler()(embedBulkMutation.error);
	}, [APIErrorHandler, embedBulkMutation.error, embedBulkMutation.isError]);

	const doctors = doctorsQuery.data?.doctors ?? [];
	const meta = doctorsQuery.data?.meta ?? {
		total: 0,
		page: 1,
		page_size: PAGE_SIZE,
		total_pages: 1,
		has_next_page: false,
		has_previous_page: false,
	};

	const onEmbedDoctor = (doctorId: string) => {
		void embedMutation.mutateAsync({ doctor_id: doctorId }).then(() => {
			toast.success("Embedding job queued for this doctor.");
		});
	};

	const onEmbedMissing = () => {
		void embedBulkMutation.mutateAsync().then((data) => {
			if (data.queued === 0) {
				toast.message("No verified doctors need embedding right now.");
				return;
			}
			toast.success(`Queued ${data.queued} embedding job(s).`);
		});
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
		onEmbedDoctor,
		onEmbedMissing,
		isEmbedDoctorLoading: embedMutation.isPending,
		embedDoctorId: embedMutation.variables?.doctor_id ?? null,
		isEmbedBulkLoading: embedBulkMutation.isPending,
	};
};

