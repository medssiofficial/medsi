import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { sendJsonApiResponse } from "@repo/utils/server";
import {
	resolvePatientUserIdByClerkId,
	uploadPatientFileByClerkId,
} from "@repo/database/actions/patient";
import { attachFileToCase, getMedicalCaseDetail } from "@repo/database/actions/medical-case";
import { SERVER_ENV } from "@/config/server-env";
import { patientFileProcessTask } from "@/trigger/tasks/patient-file-process";

const ALLOWED_UPLOAD_TYPES = new Set([
	"application/pdf",
	"image/png",
	"image/jpeg",
	"image/webp",
	"text/plain",
]);
const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

export const POST = async (req: NextRequest, context: { params: Promise<{ caseId: string }> }) => {
	try {
		const { userId: clerkId, isAuthenticated } = await auth();
		if (!isAuthenticated || !clerkId) {
			return sendJsonApiResponse({ success: false, error: "Unauthorized", code: 401 });
		}

		const userId = await resolvePatientUserIdByClerkId(clerkId);
		if (!userId) {
			return sendJsonApiResponse({ success: false, error: "Patient not found.", code: 404 });
		}

		const { caseId } = await context.params;
		const caseDetail = await getMedicalCaseDetail({ case_id: caseId, user_id: userId });
		if (!caseDetail) {
			return sendJsonApiResponse({ success: false, error: "Case not found.", code: 404 });
		}

		const contentType = req.headers.get("content-type") ?? "";

		if (contentType.includes("multipart/form-data")) {
			const formData = await req.formData();
			const fileValue = formData.get("file");

			if (!(fileValue instanceof File)) {
				return sendJsonApiResponse({
					success: false,
					error: "Please provide a file.",
					code: 400,
				});
			}

			if (!fileValue.size || fileValue.size > MAX_UPLOAD_SIZE_BYTES) {
				return sendJsonApiResponse({
					success: false,
					error: "Invalid file size.",
					code: 400,
				});
			}

			if (!ALLOWED_UPLOAD_TYPES.has(fileValue.type)) {
				return sendJsonApiResponse({
					success: false,
					error: "Unsupported file type.",
					code: 400,
				});
			}

			const uploaded = await uploadPatientFileByClerkId({
				clerk_id: clerkId,
				file: fileValue,
			});

			await attachFileToCase({ case_id: caseId, file_id: uploaded.id });

			if (uploaded.report_type === "text_report" && SERVER_ENV.TRIGGER_SECRET_KEY?.trim()) {
				try {
					await patientFileProcessTask.trigger({
						fileId: uploaded.id,
						source: "patient_upload",
					});
				} catch {
					// Non-fatal
				}
			}

			return sendJsonApiResponse({
				success: true,
				code: 201,
				data: { file: uploaded },
			});
		} else {
			const body = (await req.json()) as { file_id?: string };
			const fileId = body.file_id?.trim();

			if (!fileId) {
				return sendJsonApiResponse({
					success: false,
					error: "file_id required.",
					code: 400,
				});
			}

			await attachFileToCase({ case_id: caseId, file_id: fileId });

			return sendJsonApiResponse({
				success: true,
				code: 200,
				data: { file_id: fileId, attached: true },
			});
		}
	} catch (error) {
		return sendJsonApiResponse({
			success: false,
			error: error instanceof Error ? error.message : "Failed to attach file.",
			code: 500,
		});
	}
};
