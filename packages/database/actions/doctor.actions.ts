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
			profile: true,
			application: true,
			expertises: true,
			specializations: true,
			experiences: true,
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
		name: string;
		certificate_file_key?: string;
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
				}))
				.filter((s) => Boolean(s.name))
				.map((s) => ({
					doctor_id: doctor.id,
					name: s.name,
					certificate_file_key: s.certificate_file_key,
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

export type DoctorApplicationStatus = (typeof DOCTOR_APPLICATION_STATUSES)[number];

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
			profile: true,
			application: true,
			specializations: true,
			expertises: true,
			experiences: true,
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
						profile: true,
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
					profile: true,
					expertises: true,
					specializations: true,
					experiences: true,
				},
			},
		},
	});
};

interface ReviewDoctorApplicationByAdminArgs {
	application_id: string;
	action: "approve" | "reject";
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

		const isApprove = args.action === "approve";

		await tx.doctor_application.update({
			where: {
				id: application.id,
			},
			data: {
				status: isApprove ? "approved" : "rejected",
				rejection_reason: isApprove ? null : args.rejection_reason ?? null,
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
						profile: true,
						expertises: true,
						specializations: true,
						experiences: true,
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

	await prisma.doctor_application.upsert({
		where: {
			doctor_id: doctor.id,
		},
		create: {
			doctor_id: doctor.id,
			status: "under_review",
		},
		update: {
			status: "under_review",
			rejection_reason: null,
		},
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
		prisma.doctor.delete({ where: { id: doctor.id } }),
	]);
};
