import { getAdminByClerkId } from "@repo/database/actions/admin";
import { getDoctorFilesForAdminByDoctorId } from "@repo/database/actions/doctor";
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

		const doctorId = params?.doctorId;
		if (!doctorId) {
			throw new ApiError("Doctor id is required", 400);
		}

		const detail = await getDoctorFilesForAdminByDoctorId({
			doctor_id: doctorId,
		});

		if (!detail) {
			throw new ApiError("Doctor folder not found", 404);
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: detail,
		});
	},
});
