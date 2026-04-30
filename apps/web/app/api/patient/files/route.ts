import { getPatientFilesByClerkId } from "@repo/database/actions/patient";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const QuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(30).default(12),
	cursor: z.string().optional(),
	search: z.string().optional(),
});

export const GET = createApi({
	requireAuth: true,
	querySchema: QuerySchema,
	execute: async ({ user, query }) => {
		const result = await getPatientFilesByClerkId({
			clerk_id: user.id,
			limit: query.limit,
			cursor: query.cursor,
			search: query.search,
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: result,
		});
	},
});
