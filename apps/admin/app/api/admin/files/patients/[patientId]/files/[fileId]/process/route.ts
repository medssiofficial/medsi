import { getAdminByClerkId } from "@repo/database/actions/admin";
import { findPatientFileForAdmin } from "@repo/database/actions/patient-file-processing";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

import { SERVER_ENV } from "@/config/server-env";
import { adminPatientFileProcessTask } from "@/trigger/tasks/admin-patient-file-process";

export const POST = createApi({
	requireAuth: true,
	execute: async ({ user, params }) => {
		const admin = await getAdminByClerkId({
			clerk_id: user.id,
		});

		if (!admin) {
			throw new ApiError("Access denied", 403);
		}

		const patientId = params?.patientId;
		const fileId = params?.fileId;
		if (!patientId || !fileId) {
			throw new ApiError("Patient id and file id are required", 400);
		}

		const head = await findPatientFileForAdmin({
			user_id: patientId,
			file_id: fileId,
		});

		if (!head) {
			throw new ApiError("File not found", 404);
		}

		if (head.report_type === "image_report") {
			throw new ApiError(
				"Image reports are not supported for automated processing yet.",
				400,
			);
		}

		if (head.processing_status !== "pending" && head.processing_status !== "failed") {
			throw new ApiError("Only pending or failed text reports can be processed.", 400);
		}

		if (!SERVER_ENV.TRIGGER_SECRET_KEY?.trim()) {
			throw new ApiError("Background processing is not configured.", 503);
		}

		const handle = await adminPatientFileProcessTask.trigger({
			fileId,
			source: "admin_manual",
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				trigger_run_id: handle.id,
			},
		});
	},
});
