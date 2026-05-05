import { getPatientFileByClerkId } from "@repo/database/actions/patient";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

export const GET = createApi({
	requireAuth: true,
	execute: async ({ user, params }) => {
		const fileId = params?.fileId;
		if (!fileId) {
			throw new ApiError("File id is required", 400);
		}

		const file = await getPatientFileByClerkId({
			clerk_id: user.id,
			file_id: fileId,
		});

		if (!file) {
			throw new ApiError("File not found", 404);
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: { file },
		});
	},
});
