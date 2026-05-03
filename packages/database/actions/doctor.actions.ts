import { prisma } from "../client";
import { Prisma } from "../types/server";

interface UpsertDoctorArgs {
	clerk_id: string;
	verified?: boolean;
}

export const upsertDoctor = (args: UpsertDoctorArgs) => {
	const updateData: { verified?: boolean } = {};

	if (typeof args.verified === "boolean") {
		updateData.verified = args.verified;
	}

	return prisma.doctor.upsert({
		where: {
			clerk_id: args.clerk_id,
		},
		create: {
			clerk_id: args.clerk_id,
			verified: args.verified ?? false,
		},
		update: updateData,
	});
};

interface GetDoctorFullByClerkIdArgs {
	clerk_id: string;
}

export const getDoctorFullByClerkId = (args: GetDoctorFullByClerkIdArgs) => {
	return prisma.doctor.findUnique({
		where: {
			clerk_id: args.clerk_id,
		},
		include: {
			profile: {
				include: {
					medical_license_file: true,
					board_certification_file: true,
					government_id_front_file: true,
					government_id_back_file: true,
					experience_proof_file: true,
				},
			},
			application: true,
			expertises: true,
			specializations: {
				include: {
					certificate_file: true,
				},
			},
			experiences: {
				include: {
					experience_letter_file: true,
				},
			},
			files: true,
		},
	});
};

interface GetDoctorEmbeddingSourceByIdArgs {
	id: string;
}

/** Profile, specializations, and experiences shaped for semantic embedding text. */
export const getDoctorEmbeddingSourceById = (
	args: GetDoctorEmbeddingSourceByIdArgs,
) => {
	return prisma.doctor.findUnique({
		where: { id: args.id },
		select: {
			id: true,
			profile: {
				select: {
					name: true,
					years_of_experience: true,
					years_in_practice: true,
					city: true,
					county: true,
					country: true,
					address_line_1: true,
				},
			},
			specializations: {
				select: { name: true },
				orderBy: { name: "asc" },
			},
			experiences: {
				select: {
					start_date: true,
					end_date: true,
					hospital_name: true,
					description: true,
				},
				orderBy: { start_date: "desc" },
			},
		},
	});
};

export type DoctorEmbeddingSource = NonNullable<
	Awaited<ReturnType<typeof getDoctorEmbeddingSourceById>>
>;

interface GetDoctorInboxPendingCountByClerkIdArgs {
	clerk_id: string;
}

export const getDoctorInboxPendingCountByClerkId = async (
	args: GetDoctorInboxPendingCountByClerkIdArgs,
) => {
	const doctor = await prisma.doctor.findUnique({
		where: {
			clerk_id: args.clerk_id,
		},
		select: {
			id: true,
		},
	});

	if (!doctor) return null;

	// Current schema doesn't yet map cases to individual doctors.
	// Until assignment exists, pending inbox count reflects global pending cases.
	return prisma.medical_case.count({
		where: {
			conversation_status: "in_progress",
		},
	});
};
interface UpsertDoctorProfileByClerkIdArgs {
	clerk_id: string;
	profile: {
		years_of_experience: number;
		name: string;
		dob: Date;
		gender: "male" | "female" | "other";
		email: string;
		mobile_number: string;
		country: string;
		address_line_1: string;
		city: string;
		county: string;
	};
}


export const upsertDoctorProfileByClerkId = async (
	args: UpsertDoctorProfileByClerkIdArgs,
) => {
	const doctor = await upsertDoctor({ clerk_id: args.clerk_id });

	await prisma.doctor_profile.upsert({
		where: {
			doctor_id: doctor.id,
		},
		create: {
			doctor_id: doctor.id,
			years_of_experience: new Prisma.Decimal(
				args.profile.years_of_experience,
			),
			name: args.profile.name,
			dob: args.profile.dob,
			gender: args.profile.gender,
			email: args.profile.email,
			mobile_number: args.profile.mobile_number,
			country: args.profile.country,
			address_line_1: args.profile.address_line_1,
			city: args.profile.city,
			county: args.profile.county,
		},
		update: {
			years_of_experience: new Prisma.Decimal(
				args.profile.years_of_experience,
			),
			name: args.profile.name,
			dob: args.profile.dob,
			gender: args.profile.gender,
			email: args.profile.email,
			mobile_number: args.profile.mobile_number,
			country: args.profile.country,
			address_line_1: args.profile.address_line_1,
			city: args.profile.city,
			county: args.profile.county,
		},
	});

	return getDoctorFullByClerkId({ clerk_id: args.clerk_id });
};

interface PatchDoctorProfileByClerkIdArgs {
	clerk_id: string;
	patch: {
		medical_registration_number?: string;
		current_institution?: string;
		years_in_practice?: number;
		type_of_doctor?: string;
		website_url?: string;
		linkedin_url?: string;
		profile_statement?: string;
	};
}

export const patchDoctorProfileByClerkId = async (
	args: PatchDoctorProfileByClerkIdArgs,
) => {
	const doctorWithProfile = await prisma.doctor.findUnique({
		where: {
			clerk_id: args.clerk_id,
		},
		include: {
			profile: true,
		},
	});

	if (!doctorWithProfile?.profile) return null;

	await prisma.doctor_profile.update({
		where: {
			doctor_id: doctorWithProfile.id,
		},
		data: {
			medical_registration_number: args.patch.medical_registration_number,
			current_institution: args.patch.current_institution,
			years_in_practice:
				typeof args.patch.years_in_practice === "number"
					? args.patch.years_in_practice
					: undefined,
			type_of_doctor: args.patch.type_of_doctor,
			website_url: args.patch.website_url,
			linkedin_url: args.patch.linkedin_url,
			profile_statement: args.patch.profile_statement,
		},
	});

	return getDoctorFullByClerkId({ clerk_id: args.clerk_id });
};

interface ReplaceDoctorExpertisesByClerkIdArgs {
	clerk_id: string;
	expertises: string[];
}

export const replaceDoctorExpertisesByClerkId = async (
	args: ReplaceDoctorExpertisesByClerkIdArgs,
) => {
	const doctor = await upsertDoctor({ clerk_id: args.clerk_id });

	await prisma.$transaction([
		prisma.doctor_expertise.deleteMany({
			where: {
				doctor_id: doctor.id,
			},
		}),
		prisma.doctor_expertise.createMany({
			data: args.expertises
				.map((expertise) => expertise.trim())
				.filter(Boolean)
				.map((expertise) => ({
					doctor_id: doctor.id,
					expertise,
				})),
		}),
	]);

	return getDoctorFullByClerkId({ clerk_id: args.clerk_id });
};

interface ReplaceDoctorSpecializationsByClerkIdArgs {
	clerk_id: string;
	specializations: Array<{
		id?: string;
		name: string;
		certificate_file_key?: string;
		certificate_file_id?: string;
	}>;
}

export const replaceDoctorSpecializationsByClerkId = async (
	args: ReplaceDoctorSpecializationsByClerkIdArgs,
) => {
	const doctor = await upsertDoctor({ clerk_id: args.clerk_id });

	await prisma.$transaction([
		prisma.doctor_specialization.deleteMany({
			where: {
				doctor_id: doctor.id,
			},
		}),
		prisma.doctor_specialization.createMany({
			data: args.specializations
				.map((s) => ({
					name: s.name.trim(),
					certificate_file_key: (
						s.certificate_file_key ?? "pending"
					).trim(),
					certificate_file_id: s.certificate_file_id,
				}))
				.filter((s) => Boolean(s.name))
				.map((s) => ({
					doctor_id: doctor.id,
					name: s.name,
					certificate_file_key: s.certificate_file_key,
					certificate_file_id: s.certificate_file_id,
				})),
		}),
	]);

	return getDoctorFullByClerkId({ clerk_id: args.clerk_id });
};

interface SubmitDoctorApplicationByClerkIdArgs {
	clerk_id: string;
}

export const DOCTOR_APPLICATION_STATUSES = [
	"pending",
	"under_review",
	"approved",
	"rejected",
] as const;

export const DOCTOR_REQUIRED_PROFILE_PROOF_FIELDS = [
	"medical_license_file_id",
	"board_certification_file_id",
	"government_id_front_file_id",
	"government_id_back_file_id",
] as const;

export type DoctorApplicationStatus = (typeof DOCTOR_APPLICATION_STATUSES)[number];
export type DoctorRequiredProfileProofField =
	(typeof DOCTOR_REQUIRED_PROFILE_PROOF_FIELDS)[number];

export type DoctorProfileProofField =
	| DoctorRequiredProfileProofField
	| "experience_proof_file_id";

interface DoctorFileMetadataInput {
	proof_type:
		| "medical_license"
		| "board_certification"
		| "government_id_front"
		| "government_id_back"
		| "specialization_supporting_document"
		| "experience_supporting_document";
	filename: string;
	mime_type: string;
	bucket: string;
	storage_path: string;
	public_url: string;
	size_bytes?: number | null;
	metadata?: Prisma.InputJsonValue;
}

interface SaveDoctorProfileProofFileByClerkIdArgs {
	clerk_id: string;
	proof_field: DoctorProfileProofField;
	file: DoctorFileMetadataInput;
}

interface SaveDoctorSpecializationProofFileByClerkIdArgs {
	clerk_id: string;
	specialization_id: string;
	file: DoctorFileMetadataInput;
}

interface DeleteDoctorFileByIdArgs {
	doctor_file_id: string;
}

const generateApplicationCode = async (
	tx: Prisma.TransactionClient,
): Promise<string> => {
	const year = new Date().getUTCFullYear();

	for (let attempt = 0; attempt < 8; attempt += 1) {
		const suffix = String(Math.floor(1000 + Math.random() * 9000));
		const code = `MED-APP-${year}-${suffix}`;
		const existing = await tx.doctor_application.findUnique({
			where: {
				application_code: code,
			},
			select: {
				id: true,
			},
		});
		if (!existing) {
			return code;
		}
	}

	throw new Error("Unable to generate application code.");
};

export const saveDoctorProfileProofFileByClerkId = async (
	args: SaveDoctorProfileProofFileByClerkIdArgs,
) => {
	const doctor = await upsertDoctor({ clerk_id: args.clerk_id });

	const result = await prisma.$transaction(async (tx) => {
		const profile = await tx.doctor_profile.findUnique({
			where: {
				doctor_id: doctor.id,
			},
		});

		if (!profile) {
			throw new Error("Doctor profile not found. Save profile details first.");
		}

		const createdFile = await tx.doctor_file.create({
			data: {
				doctor_id: doctor.id,
				proof_type: args.file.proof_type,
				filename: args.file.filename,
				mime_type: args.file.mime_type,
				bucket: args.file.bucket,
				storage_path: args.file.storage_path,
				public_url: args.file.public_url,
				size_bytes: args.file.size_bytes ?? null,
				metadata: args.file.metadata,
			},
		});

		const previousFileId = profile[args.proof_field];
		await tx.doctor_profile.update({
			where: {
				doctor_id: doctor.id,
			},
			data: {
				[args.proof_field]: createdFile.id,
			},
		});

		const previousFile = previousFileId
			? await tx.doctor_file.findUnique({
					where: {
						id: previousFileId,
					},
				})
			: null;

		if (previousFileId) {
			await tx.doctor_file.delete({
				where: {
					id: previousFileId,
				},
			});
		}

		return {
			created_file: createdFile,
			replaced_file: previousFile,
		};
	});

	return {
		doctor: await getDoctorFullByClerkId({ clerk_id: args.clerk_id }),
		...result,
	};
};

export const saveDoctorSpecializationProofFileByClerkId = async (
	args: SaveDoctorSpecializationProofFileByClerkIdArgs,
) => {
	const doctor = await upsertDoctor({ clerk_id: args.clerk_id });

	const result = await prisma.$transaction(async (tx) => {
		const specialization = await tx.doctor_specialization.findFirst({
			where: {
				id: args.specialization_id,
				doctor_id: doctor.id,
			},
		});

		if (!specialization) {
			throw new Error("Specialization not found.");
		}

		const createdFile = await tx.doctor_file.create({
			data: {
				doctor_id: doctor.id,
				proof_type: args.file.proof_type,
				filename: args.file.filename,
				mime_type: args.file.mime_type,
				bucket: args.file.bucket,
				storage_path: args.file.storage_path,
				public_url: args.file.public_url,
				size_bytes: args.file.size_bytes ?? null,
				metadata: args.file.metadata,
			},
		});

		const previousFileId = specialization.certificate_file_id;
		await tx.doctor_specialization.update({
			where: {
				id: specialization.id,
			},
			data: {
				certificate_file_id: createdFile.id,
				certificate_file_key: args.file.storage_path,
			},
		});

		const previousFile = previousFileId
			? await tx.doctor_file.findUnique({
					where: {
						id: previousFileId,
					},
				})
			: null;

		if (previousFileId) {
			await tx.doctor_file.delete({
				where: {
					id: previousFileId,
				},
			});
		}

		return {
			created_file: createdFile,
			replaced_file: previousFile,
		};
	});

	return {
		doctor: await getDoctorFullByClerkId({ clerk_id: args.clerk_id }),
		...result,
	};
};

export const deleteDoctorFileById = (args: DeleteDoctorFileByIdArgs) => {
	return prisma.doctor_file.delete({
		where: {
			id: args.doctor_file_id,
		},
	});
};

interface GetDoctorsForAdminArgs {
	page: number;
	page_size: number;
	search?: string;
	verified?: "all" | "verified" | "unverified";
}

export const getDoctorsForAdmin = async (args: GetDoctorsForAdminArgs) => {
	const page = Math.max(1, args.page);
	const pageSize = Math.max(1, Math.min(50, args.page_size));
	const skip = (page - 1) * pageSize;

	const where: Prisma.doctorWhereInput = {};

	if (args.verified === "verified") {
		where.verified = true;
	} else if (args.verified === "unverified") {
		where.verified = false;
	}

	const searchTerm = args.search?.trim();
	if (searchTerm) {
		where.OR = [
			{
				id: {
					contains: searchTerm,
					mode: "insensitive",
				},
			},
			{
				clerk_id: {
					contains: searchTerm,
					mode: "insensitive",
				},
			},
			{
				profile: {
					is: {
						name: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
				},
			},
			{
				profile: {
					is: {
						email: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
				},
			},
			{
				profile: {
					is: {
						country: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
				},
			},
			{
				profile: {
					is: {
						city: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
				},
			},
			{
				profile: {
					is: {
						medical_registration_number: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
				},
			},
			{
				specializations: {
					some: {
						name: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
				},
			},
		];
	}

	const [doctors, total] = await prisma.$transaction([
		prisma.doctor.findMany({
			where,
			orderBy: {
				created_at: "desc",
			},
			skip,
			take: pageSize,
			include: {
				profile: true,
				application: true,
				specializations: true,
				expertises: true,
				embedding_state: true,
			},
		}),
		prisma.doctor.count({ where }),
	]);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return {
		items: doctors,
		meta: {
			total,
			page,
			page_size: pageSize,
			total_pages: totalPages,
			has_next_page: page < totalPages,
			has_previous_page: page > 1,
		},
	};
};

export const getDoctorApplicationsPendingOrUnderReviewCountForAdmin = () => {
	return prisma.doctor_application.count({
		where: {
			status: {
				in: ["pending", "under_review"],
			},
		},
	});
};

interface GetDoctorByIdForAdminArgs {
	doctor_id: string;
}

export const getDoctorByIdForAdmin = (args: GetDoctorByIdForAdminArgs) => {
	return prisma.doctor.findUnique({
		where: {
			id: args.doctor_id,
		},
		include: {
			profile: {
				include: {
					medical_license_file: true,
					board_certification_file: true,
					government_id_front_file: true,
					government_id_back_file: true,
					experience_proof_file: true,
				},
			},
			application: true,
			specializations: {
				include: {
					certificate_file: true,
				},
			},
			expertises: true,
			experiences: {
				include: {
					experience_letter_file: true,
				},
			},
			embedding_state: true,
		},
	});
};

interface GetDoctorApplicationsForAdminArgs {
	page: number;
	page_size: number;
	search?: string;
	status?: DoctorApplicationStatus | "all";
}

export const getDoctorApplicationsForAdmin = async (
	args: GetDoctorApplicationsForAdminArgs,
) => {
	const page = Math.max(1, args.page);
	const pageSize = Math.max(1, Math.min(50, args.page_size));
	const skip = (page - 1) * pageSize;

	const where: Prisma.doctor_applicationWhereInput = {};

	if (args.status && args.status !== "all") {
		where.status = args.status;
	}

	const searchTerm = args.search?.trim();
	if (searchTerm) {
		where.OR = [
			{
				id: {
					contains: searchTerm,
					mode: "insensitive",
				},
			},
			{
				doctor_id: {
					contains: searchTerm,
					mode: "insensitive",
				},
			},
			{
				doctor: {
					is: {
						clerk_id: {
							contains: searchTerm,
							mode: "insensitive",
						},
					},
				},
			},
			{
				doctor: {
					is: {
						profile: {
							is: {
								name: {
									contains: searchTerm,
									mode: "insensitive",
								},
							},
						},
					},
				},
			},
			{
				doctor: {
					is: {
						profile: {
							is: {
								email: {
									contains: searchTerm,
									mode: "insensitive",
								},
							},
						},
					},
				},
			},
			{
				doctor: {
					is: {
						profile: {
							is: {
								mobile_number: {
									contains: searchTerm,
									mode: "insensitive",
								},
							},
						},
					},
				},
			},
			{
				doctor: {
					is: {
						profile: {
							is: {
								country: {
									contains: searchTerm,
									mode: "insensitive",
								},
							},
						},
					},
				},
			},
		];
	}

	const [applications, total] = await prisma.$transaction([
		prisma.doctor_application.findMany({
			where,
			orderBy: {
				created_at: "desc",
			},
			skip,
			take: pageSize,
			include: {
				doctor: {
					include: {
						profile: {
							include: {
								medical_license_file: true,
								board_certification_file: true,
								government_id_front_file: true,
								government_id_back_file: true,
								experience_proof_file: true,
							},
						},
					},
				},
			},
		}),
		prisma.doctor_application.count({ where }),
	]);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return {
		items: applications,
		meta: {
			total,
			page,
			page_size: pageSize,
			total_pages: totalPages,
			has_next_page: page < totalPages,
			has_previous_page: page > 1,
		},
	};
};

interface GetDoctorApplicationForAdminArgs {
	application_id: string;
}

export const getDoctorApplicationForAdmin = (
	args: GetDoctorApplicationForAdminArgs,
) => {
	return prisma.doctor_application.findUnique({
		where: {
			id: args.application_id,
		},
		include: {
			doctor: {
				include: {
					profile: {
						include: {
							medical_license_file: true,
							board_certification_file: true,
							government_id_front_file: true,
							government_id_back_file: true,
							experience_proof_file: true,
						},
					},
					expertises: true,
					specializations: {
						include: {
							certificate_file: true,
						},
					},
					experiences: {
						include: {
							experience_letter_file: true,
						},
					},
				},
			},
		},
	});
};

interface ReviewDoctorApplicationByAdminArgs {
	application_id: string;
	status: DoctorApplicationStatus;
	rejection_reason?: string;
}

export const reviewDoctorApplicationByAdmin = async (
	args: ReviewDoctorApplicationByAdminArgs,
) => {
	return prisma.$transaction(async (tx) => {
		const application = await tx.doctor_application.findUnique({
			where: {
				id: args.application_id,
			},
		});

		if (!application) return null;

		const isApprove = args.status === "approved";
		const isRejected = args.status === "rejected";

		await tx.doctor_application.update({
			where: {
				id: application.id,
			},
			data: {
				status: args.status,
				rejection_reason: isRejected ? args.rejection_reason ?? null : null,
			},
		});

		await tx.doctor.update({
			where: {
				id: application.doctor_id,
			},
			data: {
				verified: isApprove,
			},
		});

		return tx.doctor_application.findUnique({
			where: {
				id: application.id,
			},
			include: {
				doctor: {
					include: {
						profile: {
							include: {
								medical_license_file: true,
								board_certification_file: true,
								government_id_front_file: true,
								government_id_back_file: true,
								experience_proof_file: true,
							},
						},
						expertises: true,
						specializations: {
							include: {
								certificate_file: true,
							},
						},
						experiences: {
							include: {
								experience_letter_file: true,
							},
						},
					},
				},
			},
		});
	});
};

export const submitDoctorApplicationByClerkId = async (
	args: SubmitDoctorApplicationByClerkIdArgs,
) => {
	const doctor = await upsertDoctor({ clerk_id: args.clerk_id });

	const doctorWithProfile = await prisma.doctor.findUnique({
		where: {
			id: doctor.id,
		},
		include: {
			profile: true,
			expertises: true,
			specializations: true,
		},
	});

	if (!doctorWithProfile?.profile) {
		throw new Error("Doctor profile not found. Complete your profile first.");
	}

	if (doctorWithProfile.expertises.length === 0) {
		throw new Error("Please add at least one expertise before submitting.");
	}

	if (doctorWithProfile.specializations.length === 0) {
		throw new Error("Please add at least one specialization before submitting.");
	}

	const hasRequiredWorkDetails =
		Boolean(doctorWithProfile.profile.medical_registration_number?.trim()) &&
		Boolean(doctorWithProfile.profile.current_institution?.trim()) &&
		typeof doctorWithProfile.profile.years_in_practice === "number" &&
		doctorWithProfile.profile.years_in_practice >= 0 &&
		Boolean(doctorWithProfile.profile.type_of_doctor?.trim());

	if (!hasRequiredWorkDetails) {
		throw new Error(
			"Please complete required work details before submitting your application.",
		);
	}

	const hasAllRequiredProofs = DOCTOR_REQUIRED_PROFILE_PROOF_FIELDS.every(
		(field) => Boolean(doctorWithProfile.profile?.[field]),
	);

	if (!hasAllRequiredProofs) {
		throw new Error(
			"Please upload Medical License, Board Certification, and both Government ID files before submitting.",
		);
	}

	await prisma.$transaction(async (tx) => {
		const existing = await tx.doctor_application.findUnique({
			where: {
				doctor_id: doctor.id,
			},
		});

		const applicationCode =
			existing?.application_code ?? (await generateApplicationCode(tx));

		await tx.doctor_application.upsert({
			where: {
				doctor_id: doctor.id,
			},
			create: {
				doctor_id: doctor.id,
				status: "under_review",
				application_code: applicationCode,
				submitted_at: new Date(),
			},
			update: {
				status: "under_review",
				rejection_reason: null,
				application_code: applicationCode,
				submitted_at: new Date(),
			},
		});
	});

	return getDoctorFullByClerkId({ clerk_id: args.clerk_id });
};

interface DeleteDoctorArgs {
	clerk_id: string;
}

export const deleteDoctor = async (args: DeleteDoctorArgs) => {
	const doctor = await prisma.doctor.findUnique({
		where: {
			clerk_id: args.clerk_id,
		},
	});

	if (!doctor) return;

	await prisma.$transaction([
		prisma.doctor_profile.deleteMany({ where: { doctor_id: doctor.id } }),
		prisma.doctor_expertise.deleteMany({ where: { doctor_id: doctor.id } }),
		prisma.doctor_specialization.deleteMany({
			where: { doctor_id: doctor.id },
		}),
		prisma.doctor_experience.deleteMany({ where: { doctor_id: doctor.id } }),
		prisma.doctor_application.deleteMany({ where: { doctor_id: doctor.id } }),
		prisma.doctor_file.deleteMany({ where: { doctor_id: doctor.id } }),
		prisma.doctor.delete({ where: { id: doctor.id } }),
	]);
};

interface GetDoctorFileFoldersForAdminArgs {
	page: number;
	page_size: number;
	search?: string;
}

export interface AdminDoctorFileFolderItem {
	doctor_id: string;
	name: string;
	email: string;
	file_count: number;
	last_file_at: Date | null;
}

export const getDoctorFileFoldersForAdmin = async (
	args: GetDoctorFileFoldersForAdminArgs,
) => {
	const page = Math.max(1, args.page);
	const pageSize = Math.max(1, Math.min(50, args.page_size));
	const skip = (page - 1) * pageSize;
	const searchTerm = args.search?.trim();
	const where: Prisma.doctorWhereInput = {};

	if (searchTerm) {
		where.OR = [
			{ id: { contains: searchTerm, mode: "insensitive" } },
			{ clerk_id: { contains: searchTerm, mode: "insensitive" } },
			{
				profile: {
					is: {
						name: { contains: searchTerm, mode: "insensitive" },
					},
				},
			},
			{
				profile: {
					is: {
						email: { contains: searchTerm, mode: "insensitive" },
					},
				},
			},
		];
	}

	const [rows, total] = await prisma.$transaction([
		prisma.doctor.findMany({
			where,
			orderBy: { created_at: "desc" },
			skip,
			take: pageSize,
			include: {
				profile: {
					select: {
						name: true,
						email: true,
					},
				},
				files: {
					select: {
						created_at: true,
					},
					orderBy: {
						created_at: "desc",
					},
					take: 1,
				},
				_count: {
					select: {
						files: true,
					},
				},
			},
		}),
		prisma.doctor.count({ where }),
	]);

	const items: AdminDoctorFileFolderItem[] = rows.map((row) => ({
		doctor_id: row.id,
		name: row.profile?.name?.trim() || "Unnamed doctor",
		email: row.profile?.email?.trim() || "No email",
		file_count: row._count.files,
		last_file_at: row.files[0]?.created_at ?? null,
	}));

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return {
		items,
		meta: {
			total,
			page,
			page_size: pageSize,
			total_pages: totalPages,
			has_next_page: page < totalPages,
			has_previous_page: page > 1,
		},
	};
};

interface GetDoctorFilesForAdminByDoctorIdArgs {
	doctor_id: string;
	page: number;
	page_size: number;
	search?: string;
}

export interface AdminDoctorFolderFileItem {
	id: string;
	filename: string;
	mime_type: string;
	proof_type: string;
	public_url: string;
	size_bytes: number | null;
	created_at: Date;
}

export const getDoctorFilesForAdminByDoctorId = async (
	args: GetDoctorFilesForAdminByDoctorIdArgs,
) => {
	const page = Math.max(1, args.page);
	const pageSize = Math.max(1, Math.min(50, args.page_size));
	const skip = (page - 1) * pageSize;
	const searchTerm = args.search?.trim();

	const doctor = await prisma.doctor.findUnique({
		where: { id: args.doctor_id },
		select: {
			id: true,
			profile: {
				select: {
					name: true,
					email: true,
				},
			},
		},
	});

	if (!doctor) return null;

	const where: Prisma.doctor_fileWhereInput = {
		doctor_id: args.doctor_id,
	};

	if (searchTerm) {
		where.OR = [
			{ filename: { contains: searchTerm, mode: "insensitive" } },
			{ mime_type: { contains: searchTerm, mode: "insensitive" } },
			{ id: { contains: searchTerm, mode: "insensitive" } },
		];
	}

	const [files, total] = await prisma.$transaction([
		prisma.doctor_file.findMany({
			where,
			orderBy: {
				created_at: "desc",
			},
			skip,
			take: pageSize,
		}),
		prisma.doctor_file.count({ where }),
	]);

	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	return {
		doctor: {
			id: doctor.id,
			name: doctor.profile?.name?.trim() || "Unnamed doctor",
			email: doctor.profile?.email?.trim() || "No email",
		},
		files: files.map((file) => ({
			id: file.id,
			filename: file.filename,
			mime_type: file.mime_type,
			proof_type: file.proof_type,
			public_url: file.public_url,
			size_bytes: file.size_bytes ?? null,
			created_at: file.created_at,
		} satisfies AdminDoctorFolderFileItem)),
		meta: {
			total,
			page,
			page_size: pageSize,
			total_pages: totalPages,
			has_next_page: page < totalPages,
			has_previous_page: page > 1,
		},
	};
};
