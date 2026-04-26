import type {
	getDoctorApplicationForAdmin,
	getDoctorApplicationsForAdmin,
} from "@repo/database/actions/doctor";

export type AdminApplicationsListResult = Awaited<
	ReturnType<typeof getDoctorApplicationsForAdmin>
>;

export type AdminApplicationListItem = AdminApplicationsListResult["items"][number];

export type AdminApplicationDetail = NonNullable<
	Awaited<ReturnType<typeof getDoctorApplicationForAdmin>>
>;
