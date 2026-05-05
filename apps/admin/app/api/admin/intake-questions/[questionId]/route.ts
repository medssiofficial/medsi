import { getAdminByClerkId } from "@repo/database/actions/admin";
import {
	deleteIntakeQuestion,
	updateIntakeQuestion,
} from "@repo/database/actions/intake-question";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const UpdateBodySchema = z.object({
	question_text: z.string().trim().min(1).optional(),
	response_type: z.enum(["text", "file"]).optional(),
	is_active: z.boolean().optional(),
});

export const PUT = createApi({
	requireAuth: true,
	bodySchema: UpdateBodySchema,
	execute: async ({ user, body, params }) => {
		const admin = await getAdminByClerkId({
			clerk_id: user.id,
		});

		if (!admin) {
			throw new ApiError("Access denied", 403);
		}

		const questionId = params?.questionId;
		if (!questionId) {
			throw new ApiError("Question id is required", 400);
		}

		const question = await updateIntakeQuestion({
			id: questionId,
			question_text: body.question_text,
			response_type: body.response_type,
			is_active: body.is_active,
		});

		if (!question) {
			throw new ApiError("Question not found", 404);
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				question,
			},
		});
	},
});

export const DELETE = createApi({
	requireAuth: true,
	execute: async ({ user, params }) => {
		const admin = await getAdminByClerkId({
			clerk_id: user.id,
		});

		if (!admin) {
			throw new ApiError("Access denied", 403);
		}

		const questionId = params?.questionId;
		if (!questionId) {
			throw new ApiError("Question id is required", 400);
		}

		await deleteIntakeQuestion({ id: questionId });

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: null,
		});
	},
});
