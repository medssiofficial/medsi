import { getPatientDashboardOverviewByClerkId } from "@repo/database/actions/patient";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

export const GET = createApi({
	requireAuth: true,
	execute: async ({ user }) => {
		const overview = await getPatientDashboardOverviewByClerkId({
			clerk_id: user.id,
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				overview,
			},
		});
	},
});
