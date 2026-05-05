import { getMedicalCaseDetail } from "@repo/database/actions/medical-case";
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
		if (!caseId) {
			return sendJsonApiResponse({ success: false, error: "Case ID required.", code: 400 });
		}

		const result = await getMedicalCaseDetail({ case_id: caseId, user_id: userId });
		if (!result) {
			return sendJsonApiResponse({ success: false, error: "Case not found.", code: 404 });
		}

		return sendJsonApiResponse({ success: true, code: 200, data: result });
	},
});
