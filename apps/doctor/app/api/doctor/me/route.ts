import { getDoctorFullByClerkId } from "@repo/database/actions/doctor";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

export const GET = createApi({
	requireAuth: true,
	execute: async ({ user }) => {
		const doctor = await getDoctorFullByClerkId({
			clerk_id: user.id,
		});

		if (!doctor) {
			throw new ApiError("Doctor not found", 404);
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				doctor,
			},
		});
	},
});
