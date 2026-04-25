import { submitDoctorApplicationByClerkId } from "@repo/database/actions/doctor";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

export const POST = createApi({
	requireAuth: true,
	execute: async ({ user }) => {
		const doctor = await submitDoctorApplicationByClerkId({
			clerk_id: user.id,
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				doctor,
			},
		});
	},
});
