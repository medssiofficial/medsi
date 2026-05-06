import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import { resolvePatientUserIdByClerkId } from "@repo/database/actions/patient";
import { getMedicalCaseDetail, listCaseEventLogs } from "@repo/database/actions/medical-case";
import z from "zod";

const QuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	page_size: z.coerce.number().int().min(1).max(50).default(20),
});

export const GET = createApi({
	requireAuth: true,
	querySchema: QuerySchema,
	execute: async ({ user, params, query }) => {
		const userId = await resolvePatientUserIdByClerkId(user.id);
		if (!userId) {
			return sendJsonApiResponse({ success: false, error: "Patient not found.", code: 404 });
		}

		const caseId = (await params)?.caseId as string;
		const caseDetail = await getMedicalCaseDetail({ case_id: caseId, user_id: userId });
		if (!caseDetail) {
			return sendJsonApiResponse({ success: false, error: "Case not found.", code: 404 });
		}

		const logs = await listCaseEventLogs({
			case_id: caseId,
			page: query.page,
			page_size: query.page_size,
		});

		return sendJsonApiResponse({ success: true, code: 200, data: logs });
	},
});
