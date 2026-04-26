import { getDoctorFullByClerkId } from "@repo/database/actions/doctor";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

const getReviewDocumentItems = (
	doctor: NonNullable<Awaited<ReturnType<typeof getDoctorFullByClerkId>>>,
) => {
	const profile = doctor.profile;
	if (!profile) return [];

	return [
		{
			key: "medical_license",
			label: "Medical License",
			status: profile.medical_license_file ? "uploaded" : "missing",
			url: profile.medical_license_file?.public_url ?? null,
		},
		{
			key: "board_certification",
			label: "Board Certification",
			status: profile.board_certification_file ? "uploaded" : "missing",
			url: profile.board_certification_file?.public_url ?? null,
		},
		{
			key: "government_id",
			label: "Government ID (Front/Back)",
			status:
				profile.government_id_front_file && profile.government_id_back_file
					? "uploaded"
					: "missing",
			url:
				profile.government_id_front_file?.public_url ??
				profile.government_id_back_file?.public_url ??
				null,
		},
	];
};

export const GET = createApi({
	requireAuth: true,
	execute: async ({ user }) => {
		const doctor = await getDoctorFullByClerkId({
			clerk_id: user.id,
		});

		if (!doctor) {
			throw new ApiError("Doctor not found", 404);
		}

		if (!doctor.application) {
			throw new ApiError("Application not found", 404);
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: {
				status: doctor.application.status,
				application_id: doctor.application.application_code ?? doctor.application.id,
				submitted_at:
					doctor.application.submitted_at?.toISOString() ??
					doctor.application.updated_at.toISOString(),
				documents: getReviewDocumentItems(doctor),
			},
		});
	},
});
