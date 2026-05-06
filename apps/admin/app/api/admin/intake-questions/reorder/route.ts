import { getAdminByClerkId } from "@repo/database/actions/admin";
import { reorderIntakeQuestions } from "@repo/database/actions/intake-question";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const BodySchema = z.object({
	ordered_ids: z.array(z.string().min(1)).min(1),
});

export const PATCH = createApi({
	requireAuth: true,
	bodySchema: BodySchema,
	execute: async ({ user, body }) => {
		const admin = await getAdminByClerkId({
			clerk_id: user.id,
		});

		if (!admin) {
			throw new ApiError("Access denied", 403);
		}

		await reorderIntakeQuestions({ ordered_ids: body.ordered_ids });

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: null,
		});
	},
});
