import { replaceDoctorExpertisesByClerkId } from "@repo/database/actions/doctor";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const bodySchema = z.object({
	expertises: z.array(z.string().min(1)).default([]),
});

export const PUT = createApi({
	requireAuth: true,
	bodySchema,
	execute: async ({ user, body }) => {
		const doctor = await replaceDoctorExpertisesByClerkId({
			clerk_id: user.id,
			expertises: body.expertises,
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
