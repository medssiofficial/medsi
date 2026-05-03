import { getAdminByClerkId } from "@repo/database/actions/admin";
import { getDoctorByIdForAdmin } from "@repo/database/actions/doctor";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

import { doctorEmbeddingTask } from "@/trigger/tasks/doctor-embedding";

export const POST = createApi({
	requireAuth: true,
	execute: async ({ user, params }) => {
		const admin = await getAdminByClerkId({
			clerk_id: user.id,
		});

		if (!admin) {
			throw new ApiError("Access denied", 403);
		}

		const doctorId = params?.doctorId;
		if (!doctorId) {
			throw new ApiError("Doctor id is required", 400);
		}

		const doctor = await getDoctorByIdForAdmin({
			doctor_id: doctorId,
		});

		if (!doctor) {
			throw new ApiError("Doctor not found", 404);
		}

		if (!doctor.profile) {
			throw new ApiError("Doctor profile is required before embedding.", 400);
		}

		const handle = await doctorEmbeddingTask.trigger({
			doctorId,
			source: "manual",
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
