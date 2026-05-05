import { getAdminByClerkId } from "@repo/database/actions/admin";
import { getTextReportFileIdsEligibleForBulkByUserId } from "@repo/database/actions/patient-file-processing";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import { tasks } from "@trigger.dev/sdk";

import { SERVER_ENV } from "@/config/server-env";

export const POST = createApi({
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

		if (!SERVER_ENV.TRIGGER_SECRET_KEY?.trim()) {
			throw new ApiError("Background processing is not configured.", 503);
		}

		const fileIds = await getTextReportFileIdsEligibleForBulkByUserId(patientId);

		if (fileIds.length === 0) {
			return sendJsonApiResponse({
				success: true,
				code: 200,
				data: {
					queued: 0,
					file_ids: [] as string[],
				},
			});
		}

		await tasks.batchTrigger(
			"admin-patient-file-process",
			fileIds.map((fileId) => ({
				payload: { fileId, source: "admin_bulk" as const },
			})),
		);

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				queued: fileIds.length,
				file_ids: fileIds,
			},
		});
	},
});
