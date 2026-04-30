import { getAdminByClerkId } from "@repo/database/actions/admin";
import { getPatientFilesForAdminByUserId } from "@repo/database/actions/patient";
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

		const patientId = params?.patientId;
		if (!patientId) {
			throw new ApiError("Patient id is required", 400);
		}

		const detail = await getPatientFilesForAdminByUserId({
			user_id: patientId,
		});

		if (!detail) {
			throw new ApiError("Patient folder not found", 404);
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: detail,
		});
	},
});
