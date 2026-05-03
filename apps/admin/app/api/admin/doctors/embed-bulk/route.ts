import { getAdminByClerkId } from "@repo/database/actions/admin";
import { getVerifiedDoctorIdsEligibleForBulkEmbed } from "@repo/database/actions/doctor-embedding";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import { tasks } from "@trigger.dev/sdk";

export const POST = createApi({
	requireAuth: true,
	execute: async ({ user }) => {
		const admin = await getAdminByClerkId({
			clerk_id: user.id,
		});

		if (!admin) {
			throw new ApiError("Access denied", 403);
		}

		const doctorIds = await getVerifiedDoctorIdsEligibleForBulkEmbed();

		if (doctorIds.length === 0) {
			return sendJsonApiResponse({
				success: true,
				code: 200,
				data: {
					queued: 0,
					doctor_ids: [] as string[],
				},
			});
		}

		await tasks.batchTrigger(
			"admin-doctor-embed",
			doctorIds.map((doctorId) => ({
				payload: { doctorId, source: "bulk" as const },
			})),
		);

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				queued: doctorIds.length,
				doctor_ids: doctorIds,
			},
		});
	},
});
