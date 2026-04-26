import { submitDoctorApplicationByClerkId } from "@repo/database/actions/doctor";
import { sendApplicationSubmittedEmail } from "@repo/email";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

export const POST = createApi({
	requireAuth: true,
	execute: async ({ user }) => {
		const doctor = await submitDoctorApplicationByClerkId({
			clerk_id: user.id,
		});
		if (!doctor) {
			throw new ApiError("Doctor not found", 404);
		}

		const doctorEmail = doctor.profile?.email?.trim();
		if (doctorEmail) {
			sendApplicationSubmittedEmail({
				to: doctorEmail,
				doctorName: doctor.profile?.name ?? "Doctor",
			}).catch((error) => {
				console.error("Failed to send submitted email", error);
			});
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				doctor,
			},
		});
	},
});
