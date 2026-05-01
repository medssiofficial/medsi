import { getAdminByClerkId } from "@repo/database/actions/admin";
import { getPatientFilesForAdminByUserId } from "@repo/database/actions/patient";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const QuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	page_size: z.coerce.number().int().min(1).max(50).default(12),
	search: z.string().optional(),
});

export const GET = createApi({
	requireAuth: true,
	querySchema: QuerySchema,
	execute: async ({ user, params, query }) => {
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
			page: query.page,
			page_size: query.page_size,
			search: query.search,
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
