import { upsertPatientProfileByClerkId } from "@repo/database/actions/patient";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const BodySchema = z.object({
	name: z.string().trim().min(1),
	age: z.number().int().min(1),
	gender: z.enum(["male", "female", "other"]),
	email: z.email(),
	phone: z.string().trim().min(3),
	country: z.string().trim().min(1),
});

export const PUT = createApi({
	requireAuth: true,
	bodySchema: BodySchema,
	execute: async ({ user, body }) => {
		const patient = await upsertPatientProfileByClerkId({
			clerk_id: user.id,
			profile: {
				name: body.name,
				age: body.age,
				gender: body.gender,
				email: body.email,
				phone: body.phone,
				country: body.country,
			},
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				patient,
				is_onboarding_complete: true,
			},
		});
	},
});
