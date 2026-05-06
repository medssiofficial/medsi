import { getCaseMessages } from "@repo/database/actions/medical-case";
import { resolvePatientUserIdByClerkId } from "@repo/database/actions/patient";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

export const GET = createApi({
	requireAuth: true,
	execute: async ({ user, params }) => {
		const userId = await resolvePatientUserIdByClerkId(user.id);
		if (!userId) {
			return sendJsonApiResponse({ success: false, error: "Patient not found.", code: 404 });
		}

		const caseId = (await params)?.caseId as string;
		const messages = await getCaseMessages({ case_id: caseId, user_id: userId });

		return sendJsonApiResponse({ success: true, code: 200, data: { messages } });
	},
});
