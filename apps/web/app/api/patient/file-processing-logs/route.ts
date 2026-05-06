import { listPatientFileProcessingLogsForPatient } from "@repo/database/actions/patient-file-processing";
import { resolvePatientUserIdByClerkId } from "@repo/database/actions/patient";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const QuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	page_size: z.coerce.number().int().min(1).max(50).default(20),
});

export const GET = createApi({
	requireAuth: true,
	querySchema: QuerySchema,
	execute: async ({ user, query }) => {
		const userId = await resolvePatientUserIdByClerkId(user.id);
		if (!userId) {
			throw new ApiError("Patient not found", 404);
		}

		const result = await listPatientFileProcessingLogsForPatient({
			user_id: userId,
			page: query.page,
			page_size: query.page_size,
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: result,
		});
	},
});
