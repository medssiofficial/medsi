import { getAdminByClerkId } from "@repo/database/actions/admin";
import {
	createIntakeQuestion,
	listIntakeQuestionsForAdmin,
} from "@repo/database/actions/intake-question";
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

		const result = await listIntakeQuestionsForAdmin({
			page: query.page,
			page_size: query.page_size,
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				intake_questions: result.items,
				meta: result.meta,
			},
		});
	},
});

const CreateBodySchema = z.object({
	question_text: z.string().trim().min(1, "Question text is required"),
	response_type: z.enum(["text", "file"]),
});

export const POST = createApi({
	requireAuth: true,
	bodySchema: CreateBodySchema,
	execute: async ({ user, body }) => {
		const admin = await getAdminByClerkId({
			clerk_id: user.id,
		});

		if (!admin) {
			throw new ApiError("Access denied", 403);
		}

		const question = await createIntakeQuestion({
			question_text: body.question_text,
			response_type: body.response_type,
		});

		return sendJsonApiResponse({
			success: true,
			code: 201,
			data: {
				question,
			},
		});
	},
});
