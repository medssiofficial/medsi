import { replaceDoctorSpecializationsByClerkId } from "@repo/database/actions/doctor";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const bodySchema = z.object({
	specializations: z
		.array(
			z.object({
				id: z.string().optional(),
				name: z.string().min(1),
				certificate_file_key: z.string().optional(),
				certificate_file_id: z.string().optional(),
			}),
		)
		.default([]),
});

export const PUT = createApi({
	requireAuth: true,
	bodySchema,
	execute: async ({ user, body }) => {
		const doctor = await replaceDoctorSpecializationsByClerkId({
			clerk_id: user.id,
			specializations: body.specializations,
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				doctor,
			},
		});
	},
});
