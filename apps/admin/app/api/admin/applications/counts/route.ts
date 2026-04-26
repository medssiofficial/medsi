import { getAdminByClerkId } from "@repo/database/actions/admin";
import { getDoctorApplicationsPendingOrUnderReviewCountForAdmin } from "@repo/database/actions/doctor";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

export const GET = createApi({
	requireAuth: true,
	execute: async ({ user }) => {
		const admin = await getAdminByClerkId({
			clerk_id: user.id,
		});

		if (!admin) {
			throw new ApiError("Access denied", 403);
		}

		const pending_or_under_review_count =
			await getDoctorApplicationsPendingOrUnderReviewCountForAdmin();

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				pending_or_under_review_count,
			},
		});
	},
});
