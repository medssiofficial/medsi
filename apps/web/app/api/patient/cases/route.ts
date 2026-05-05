import { getPatientCasesByClerkId, resolvePatientUserIdByClerkId } from "@repo/database/actions/patient";
import { createMedicalCase } from "@repo/database/actions/medical-case";
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
		const result = await getPatientCasesByClerkId({
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

export const POST = createApi({
	requireAuth: true,
	execute: async ({ user }) => {
		const userId = await resolvePatientUserIdByClerkId(user.id);
		if (!userId) {
			return sendJsonApiResponse({ success: false, error: "Patient not found.", code: 404 });
		}

		const result = await createMedicalCase({ user_id: userId });

		return sendJsonApiResponse({ success: true, code: 201, data: { case: result } });
	},
});
