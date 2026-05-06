import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import { resolvePatientUserIdByClerkId } from "@repo/database/actions/patient";
import { getMedicalCaseDetail } from "@repo/database/actions/medical-case";

export const GET = createApi({
	requireAuth: true,
	execute: async ({ user, params }) => {
		const userId = await resolvePatientUserIdByClerkId(user.id);
		if (!userId) {
			return sendJsonApiResponse({ success: false, error: "Patient not found.", code: 404 });
		}

		const caseId = (await params)?.caseId as string;
		const caseDetail = await getMedicalCaseDetail({ case_id: caseId, user_id: userId });
		if (!caseDetail) {
			return sendJsonApiResponse({ success: false, error: "Case not found.", code: 404 });
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				case_stage: caseDetail.case_stage,
				analysis: caseDetail.analysis ?? null,
				embedding_state: caseDetail.embedding_state ?? null,
			},
		});
	},
});
