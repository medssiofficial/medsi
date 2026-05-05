import { getPatientFileByClerkId } from "@repo/database/actions/patient";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

import { patientFileProcessTask } from "@/trigger/tasks/patient-file-process";
import { SERVER_ENV } from "@/config/server-env";

export const POST = createApi({
	requireAuth: true,
	execute: async ({ user, params }) => {
		const fileId = params?.fileId;
		if (!fileId) {
			throw new ApiError("File id is required", 400);
		}

		const file = await getPatientFileByClerkId({
			clerk_id: user.id,
			file_id: fileId,
		});

		if (!file) {
			throw new ApiError("File not found", 404);
		}

		if (file.report_type === "image_report") {
			throw new ApiError("Image reports are not supported for automated processing yet.", 400);
		}

		if (file.processing_status !== "pending" && file.processing_status !== "failed") {
			throw new ApiError("Only pending or failed text reports can be processed.", 400);
		}

		if (!SERVER_ENV.TRIGGER_SECRET_KEY?.trim()) {
			throw new ApiError("Background processing is not configured.", 503);
		}

		const handle = await patientFileProcessTask.trigger({
			fileId,
			source: "patient_manual",
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
