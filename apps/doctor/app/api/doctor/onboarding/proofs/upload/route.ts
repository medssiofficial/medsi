import {
	saveDoctorProfileProofFileByClerkId,
	saveDoctorSpecializationProofFileByClerkId,
	type DoctorProfileProofField,
} from "@repo/database/actions/doctor";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import { deleteFile, uploadPublicFile } from "@repo/supabase";

const ALLOWED_MIME_TYPES = new Set([
	"application/pdf",
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const PROFILE_PROOF_FIELD_MAP: Record<
	| "medical_license"
	| "board_certification"
	| "government_id_front"
	| "government_id_back"
	| "experience_supporting_document",
	DoctorProfileProofField
> = {
	medical_license: "medical_license_file_id",
	board_certification: "board_certification_file_id",
	government_id_front: "government_id_front_file_id",
	government_id_back: "government_id_back_file_id",
	experience_supporting_document: "experience_proof_file_id",
};

export const POST = createApi({
	requireAuth: true,
	execute: async ({ req, user }) => {
		const formData = await req.formData();
		const proofType = formData.get("proof_type");
		const specializationId = formData.get("specialization_id");
		const file = formData.get("file");

		if (typeof proofType !== "string" || proofType.trim().length === 0) {
			throw new ApiError("Proof type is required.", 400);
		}

		if (!(file instanceof File)) {
			throw new ApiError("A file is required.", 400);
		}

		if (file.size > MAX_FILE_SIZE_BYTES) {
			throw new ApiError("File size must be 10 MB or less.", 400);
		}

		if (!ALLOWED_MIME_TYPES.has(file.type)) {
			throw new ApiError(
				"Unsupported file type. Only PDF, JPG, JPEG, PNG and WEBP are allowed.",
				400,
			);
		}

		const upload = await uploadPublicFile({
			file: Buffer.from(await file.arrayBuffer()),
			fileName: file.name,
			folder: `doctor_${user.id}/${proofType}`,
			contentType: file.type,
		});

		if (!upload.success) {
			throw new ApiError(upload.error, 400);
		}

		try {
			if (proofType === "specialization_supporting_document") {
				if (typeof specializationId !== "string" || !specializationId.trim()) {
					throw new ApiError(
						"Specialization ID is required for specialization proof.",
						400,
					);
				}

				const result = await saveDoctorSpecializationProofFileByClerkId({
					clerk_id: user.id,
					specialization_id: specializationId,
					file: {
						proof_type: "specialization_supporting_document",
						filename: file.name,
						mime_type: file.type,
						bucket: upload.data.bucket,
						storage_path: upload.data.path,
						public_url: upload.data.publicUrl,
						size_bytes: upload.data.size,
					},
				});

				if (result.replaced_file) {
					await deleteFile({
						file: {
							bucket: result.replaced_file.bucket,
							path: result.replaced_file.storage_path,
						},
					});
				}

				return sendJsonApiResponse({
					success: true,
					code: 200,
					data: {
						doctor: result.doctor,
					},
				});
			}

			const proofField = PROFILE_PROOF_FIELD_MAP[
				proofType as keyof typeof PROFILE_PROOF_FIELD_MAP
			];
			if (!proofField) {
				throw new ApiError("Invalid proof type.", 400);
			}

			const result = await saveDoctorProfileProofFileByClerkId({
				clerk_id: user.id,
				proof_field: proofField,
				file: {
					proof_type:
						proofType as keyof typeof PROFILE_PROOF_FIELD_MAP,
					filename: file.name,
					mime_type: file.type,
					bucket: upload.data.bucket,
					storage_path: upload.data.path,
					public_url: upload.data.publicUrl,
					size_bytes: upload.data.size,
				},
			});

			if (result.replaced_file) {
				await deleteFile({
					file: {
						bucket: result.replaced_file.bucket,
						path: result.replaced_file.storage_path,
					},
				});
			}

			return sendJsonApiResponse({
				success: true,
				code: 200,
				data: {
					doctor: result.doctor,
				},
			});
		} catch (error) {
			await deleteFile({
				file: {
					bucket: upload.data.bucket,
					path: upload.data.path,
				},
			});
			throw error;
		}
	},
});
