import { getAdminByClerkId } from "@repo/database/actions/admin";
import { getDoctorApplicationForAdmin } from "@repo/database/actions/doctor";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

export const GET = createApi({
	requireAuth: true,
	execute: async ({ user, params }) => {
		const admin = await getAdminByClerkId({
			clerk_id: user.id,
		});

		if (!admin) {
			throw new ApiError("Access denied", 403);
		}

		const applicationId = params?.applicationId;
		if (!applicationId) {
			throw new ApiError("Application id is required", 400);
		}

		const application = await getDoctorApplicationForAdmin({
			application_id: applicationId,
		});

		if (!application) {
			throw new ApiError("Application not found", 404);
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				application,
			},
		});
	},
});
