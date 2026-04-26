import { patchDoctorProfileByClerkId } from "@repo/database/actions/doctor";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const bodySchema = z.object({
	medical_registration_number: z.string().optional(),
	current_institution: z.string().optional(),
	years_in_practice: z.number().optional(),
	type_of_doctor: z.string().optional(),
	website_url: z.string().optional(),
	linkedin_url: z.string().optional(),
	profile_statement: z.string().optional(),
});

export const PUT = createApi({
	requireAuth: true,
	bodySchema,
	execute: async ({ user, body }) => {
		const doctor = await patchDoctorProfileByClerkId({
			clerk_id: user.id,
			patch: body,
		});

		if (!doctor) {
			throw new ApiError(
				"Doctor profile not found. Save profile information first.",
				400,
			);
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				doctor,
			},
		});
	},
});
