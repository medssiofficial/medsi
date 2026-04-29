import {
	getPatientFullByClerkId,
	isPatientOnboardingCompleteByClerkId,
	upsertPatientByClerkId,
} from "@repo/database/actions/patient";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

export const GET = createApi({
	requireAuth: true,
	execute: async ({ user }) => {
		await upsertPatientByClerkId({ clerk_id: user.id });

		const patient = await getPatientFullByClerkId({ clerk_id: user.id });
		const is_onboarding_complete =
			await isPatientOnboardingCompleteByClerkId({ clerk_id: user.id });

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				patient,
				is_onboarding_complete,
			},
		});
	},
});
