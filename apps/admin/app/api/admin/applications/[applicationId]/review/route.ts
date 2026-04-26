import { getAdminByClerkId } from "@repo/database/actions/admin";
import { reviewDoctorApplicationByAdmin } from "@repo/database/actions/doctor";
import {
	sendApplicationAcceptedEmail,
	sendApplicationRejectedEmail,
} from "@repo/email";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";
import { DOCTOR_APPLICATION_STATUSES } from "@repo/database/actions/doctor";

const BodySchema = z
	.object({
		status: z.enum(DOCTOR_APPLICATION_STATUSES),
		rejection_reason: z.string().trim().optional(),
	})
	.superRefine((value, ctx) => {
		if (value.status !== "rejected") return;
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
			status: body.status,
			rejection_reason: body.rejection_reason,
		});

		if (!application) {
			throw new ApiError("Application not found", 404);
		}

		const doctorEmail = application.doctor.profile?.email?.trim();
		if (doctorEmail) {
			if (body.status === "approved") {
				await sendApplicationAcceptedEmail({
					to: doctorEmail,
					doctorName: application.doctor.profile?.name ?? "Doctor",
				});
			} else if (body.status === "rejected" && body.rejection_reason) {
				await sendApplicationRejectedEmail({
					to: doctorEmail,
					doctorName: application.doctor.profile?.name ?? "Doctor",
					reason: body.rejection_reason,
				});
			}
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
