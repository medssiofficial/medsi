import { getAdminByClerkId } from "@repo/database/actions/admin";
import { getMedicalCaseDetailForAdmin } from "@repo/database/actions/medical-case";
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

		const caseId = params?.caseId;
		if (!caseId) {
			throw new ApiError("Case id is required", 400);
		}

		const medicalCase = await getMedicalCaseDetailForAdmin({
			case_id: caseId,
		});

		if (!medicalCase) {
			throw new ApiError("Medical case not found", 404);
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				medical_case: medicalCase,
			},
		});
	},
});
