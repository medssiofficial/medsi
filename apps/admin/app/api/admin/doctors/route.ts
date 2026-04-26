import { getAdminByClerkId } from "@repo/database/actions/admin";
import { getDoctorsForAdmin } from "@repo/database/actions/doctor";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const QuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	page_size: z.coerce.number().int().min(1).max(50).default(10),
	search: z.string().optional(),
	verified: z.enum(["all", "verified", "unverified"]).default("all"),
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

		const result = await getDoctorsForAdmin({
			page: query.page,
			page_size: query.page_size,
			search: query.search,
			verified: query.verified,
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				doctors: result.items,
				meta: result.meta,
			},
		});
	},
});
