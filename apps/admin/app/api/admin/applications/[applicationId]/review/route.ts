import { getAdminByClerkId } from "@repo/database/actions/admin";
import { reviewDoctorApplicationByAdmin } from "@repo/database/actions/doctor";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const BodySchema = z
	.object({
		action: z.enum(["approve", "reject"]),
		rejection_reason: z.string().trim().optional(),
	})
	.superRefine((value, ctx) => {
		if (value.action !== "reject") return;
		if (value.rejection_reason && value.rejection_reason.length > 0) return;
		ctx.addIssue({
			code: "custom",
			message: "Rejection reason is required.",
			path: ["rejection_reason"],
		});
	});

export const PATCH = createApi({
	requireAuth: true,
	bodySchema: BodySchema,
	execute: async ({ user, body, params }) => {
		const admin = await getAdminByClerkId({
			clerk_id: user.id,
		});

		if (!admin) {
			throw new ApiError("Access denied", 403);
		}

		const applicationId = params?.applicationId;
		if (!applicationId) {
			throw new ApiError("Application id is required", 400);
		}

		const application = await reviewDoctorApplicationByAdmin({
			application_id: applicationId,
			action: body.action,
			rejection_reason: body.rejection_reason,
		});

		if (!application) {
			throw new ApiError("Application not found", 404);
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				application,
			},
		});
	},
});
