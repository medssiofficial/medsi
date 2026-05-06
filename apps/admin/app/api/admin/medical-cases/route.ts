import { getAdminByClerkId } from "@repo/database/actions/admin";
import { listMedicalCasesForAdmin } from "@repo/database/actions/medical-case";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const QuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	page_size: z.coerce.number().int().min(1).max(50).default(20),
	search: z.string().optional(),
	stage: z.string().optional(),
	status: z.string().optional(),
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

		const result = await listMedicalCasesForAdmin({
			page: query.page,
			page_size: query.page_size,
			search: query.search,
			stage: query.stage,
			status: query.status,
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				cases: result.items,
				meta: result.meta,
			},
		});
	},
});
