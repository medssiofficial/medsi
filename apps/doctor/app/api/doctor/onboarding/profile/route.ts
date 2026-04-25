import { upsertDoctorProfileByClerkId } from "@repo/database/actions/doctor";
import { sendJsonApiResponse, createApi } from "@repo/utils/server";
import z from "zod";

const bodySchema = z.object({
	years_of_experience: z.number().min(0),
	name: z.string().min(1),
	dob: z.coerce.date(),
	gender: z.enum(["male", "female", "other"]),
	email: z.string().email(),
	mobile_number: z.string().min(3),
	country: z.string().min(1),
	address_line_1: z.string().min(1),
	city: z.string().min(1),
	county: z.string().min(1),
});

export const PUT = createApi({
	requireAuth: true,
	bodySchema,
	execute: async ({ user, body }) => {
		const doctor = await upsertDoctorProfileByClerkId({
			clerk_id: user.id,
			profile: {
				years_of_experience: body.years_of_experience,
				name: body.name,
				dob: body.dob,
				gender: body.gender,
				email: body.email,
				mobile_number: body.mobile_number,
				country: body.country,
				address_line_1: body.address_line_1,
				city: body.city,
				county: body.county,
			},
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
