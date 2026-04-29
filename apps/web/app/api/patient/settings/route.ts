import {
	getPatientSettingsByClerkId,
	upsertPatientSettingsByClerkId,
} from "@repo/database/actions/patient";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import z from "zod";

const BodySchema = z.object({
	notifications_enabled: z.boolean(),
	language: z.string().trim().min(1),
	data_sharing: z.enum(["limited", "full"]),
});

export const GET = createApi({
	requireAuth: true,
	execute: async ({ user }) => {
		const settings = await getPatientSettingsByClerkId({ clerk_id: user.id });

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				settings,
			},
		});
	},
});

export const PUT = createApi({
	requireAuth: true,
	bodySchema: BodySchema,
	execute: async ({ user, body }) => {
		const settings = await upsertPatientSettingsByClerkId({
			clerk_id: user.id,
			settings: body,
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				settings,
			},
		});
	},
});
