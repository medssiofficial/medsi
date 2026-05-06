import { getAdminByClerkId } from "@repo/database/actions/admin";
import { listPatientFileProcessingLogsForAdmin } from "@repo/database/actions/patient-file-processing";
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
		const admin = await getAdminByClerkId({
			clerk_id: user.id,
		});

		if (!admin) {
			throw new ApiError("Access denied", 403);
		}

		const result = await listPatientFileProcessingLogsForAdmin({
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
