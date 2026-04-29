import { prisma } from "../client";
import type { Prisma } from "../types/server";

interface UpsertPatientByClerkIdArgs {
	clerk_id: string;
}

export const upsertPatientByClerkId = (args: UpsertPatientByClerkIdArgs) => {
	return prisma.user.upsert({
		where: {
			clerk_id: args.clerk_id,
		},
		create: {
			clerk_id: args.clerk_id,
		},
		update: {},
	});
};

export const upsertPatient = upsertPatientByClerkId;

interface GetPatientFullByClerkIdArgs {
	clerk_id: string;
}

export const getPatientFullByClerkId = (args: GetPatientFullByClerkIdArgs) => {
	return prisma.user.findUnique({
		where: {
			clerk_id: args.clerk_id,
		},
		include: {
			profile: true,
		},
	});
};

interface SyncPatientProfileByClerkIdArgs {
	clerk_id: string;
	name?: string | null;
	email?: string | null;
	phone?: string | null;
	image_url?: string | null;
}

export const syncPatientProfileByClerkId = async (
	args: SyncPatientProfileByClerkIdArgs,
) => {
	const patient = await prisma.user.findUnique({
		where: {
			clerk_id: args.clerk_id,
		},
		include: {
			profile: true,
		},
	});

	if (!patient?.profile) return patient;

	await prisma.patient_profile.update({
		where: {
			user_id: patient.id,
		},
		data: {
			name: args.name ?? patient.profile.name,
			email: args.email ?? patient.profile.email,
			phone: args.phone ?? patient.profile.phone,
			// NOTE: image_url is not persisted yet because no column exists.
		},
	});

	return prisma.user.findUnique({
		where: {
			id: patient.id,
		},
		include: {
			profile: true,
		},
	});
};

interface UpsertPatientProfileByClerkIdArgs {
	clerk_id: string;
	profile: {
		name: string;
		age: number;
		gender: "male" | "female" | "other";
		email: string;
		phone: string;
		country: string;
	};
}

export const upsertPatientProfileByClerkId = async (
	args: UpsertPatientProfileByClerkIdArgs,
) => {
	const patient = await upsertPatientByClerkId({ clerk_id: args.clerk_id });

	await prisma.patient_profile.upsert({
		where: {
			user_id: patient.id,
		},
		create: {
			user_id: patient.id,
			name: args.profile.name,
			age: args.profile.age,
			gender: args.profile.gender,
			email: args.profile.email,
			phone: args.profile.phone,
			country: args.profile.country,
		},
		update: {
			name: args.profile.name,
			age: args.profile.age,
			gender: args.profile.gender,
			email: args.profile.email,
			phone: args.profile.phone,
			country: args.profile.country,
		},
	});

	return getPatientFullByClerkId({ clerk_id: args.clerk_id });
};

interface IsPatientOnboardingCompleteByClerkIdArgs {
	clerk_id: string;
}

export const isPatientOnboardingCompleteByClerkId = async (
	args: IsPatientOnboardingCompleteByClerkIdArgs,
) => {
	const patient = await getPatientFullByClerkId({ clerk_id: args.clerk_id });
	const profile = patient?.profile;

	if (!profile) return false;

	return Boolean(
		profile.name.trim() &&
			profile.age > 0 &&
			profile.gender &&
			profile.email.trim() &&
			profile.phone.trim() &&
			profile.country.trim(),
	);
};

interface DeletePatientArgs {
	clerk_id: string;
}

export const deletePatient = async (args: DeletePatientArgs) => {
	const patient = await prisma.user.findUnique({
		where: {
			clerk_id: args.clerk_id,
		},
	});

	if (!patient) return;

	await prisma.user.delete({
		where: {
			id: patient.id,
		},
	});
};

interface UpdatePatientProfileByClerkIdArgs {
	clerk_id: string;
	profile: {
		name: string;
		age: number;
		gender: "male" | "female" | "other";
		email: string;
		phone: string;
		country: string;
	};
}

export const updatePatientProfileByClerkId = async (
	args: UpdatePatientProfileByClerkIdArgs,
) => {
	const patient = await upsertPatientByClerkId({ clerk_id: args.clerk_id });

	await prisma.patient_profile.upsert({
		where: {
			user_id: patient.id,
		},
		create: {
			user_id: patient.id,
			name: args.profile.name,
			age: args.profile.age,
			gender: args.profile.gender,
			email: args.profile.email,
			phone: args.profile.phone,
			country: args.profile.country,
		},
		update: {
			name: args.profile.name,
			age: args.profile.age,
			gender: args.profile.gender,
			email: args.profile.email,
			phone: args.profile.phone,
			country: args.profile.country,
		},
	});

	return getPatientFullByClerkId({ clerk_id: args.clerk_id });
};

export interface PatientSettingsRecord {
	notifications_enabled: boolean;
	language: string;
	data_sharing: "limited" | "full";
}

interface GetPatientSettingsByClerkIdArgs {
	clerk_id: string;
}

export const getPatientSettingsByClerkId = async (
	args: GetPatientSettingsByClerkIdArgs,
): Promise<PatientSettingsRecord> => {
	const patient = await upsertPatientByClerkId({ clerk_id: args.clerk_id });
	const settings = await prisma.patient_settings.upsert({
		where: {
			user_id: patient.id,
		},
		create: {
			user_id: patient.id,
		},
		update: {},
	});

	return {
		notifications_enabled: settings.notifications_enabled,
		language: settings.language,
		data_sharing: settings.data_sharing,
	};
};

interface UpsertPatientSettingsByClerkIdArgs {
	clerk_id: string;
	settings: PatientSettingsRecord;
}

export const upsertPatientSettingsByClerkId = async (
	args: UpsertPatientSettingsByClerkIdArgs,
): Promise<PatientSettingsRecord> => {
	const patient = await upsertPatientByClerkId({ clerk_id: args.clerk_id });
	const settings = await prisma.patient_settings.upsert({
		where: {
			user_id: patient.id,
		},
		create: {
			user_id: patient.id,
			notifications_enabled: args.settings.notifications_enabled,
			language: args.settings.language,
			data_sharing: args.settings.data_sharing,
		},
		update: {
			notifications_enabled: args.settings.notifications_enabled,
			language: args.settings.language,
			data_sharing: args.settings.data_sharing,
		},
	});

	return {
		notifications_enabled: settings.notifications_enabled,
		language: settings.language,
		data_sharing: settings.data_sharing,
	};
};

interface GetPatientsForAdminArgs {
	page: number;
	page_size: number;
	search?: string;
}

export interface AdminPatientListItem {
	profile_id: string;
	user_id: string;
	name: string;
	email: string;
	account_status: "active";
	join_date: Date;
	cases_count: number;
}

export const getPatientsForAdmin = async (args: GetPatientsForAdminArgs) => {
	const page = Math.max(1, args.page);
	const pageSize = Math.max(1, Math.min(50, args.page_size));
	const skip = (page - 1) * pageSize;

	const where: Prisma.patient_profileWhereInput = {};
	const searchTerm = args.search?.trim();

	if (searchTerm) {
		where.OR = [
			{ name: { contains: searchTerm, mode: "insensitive" } },
			{ email: { contains: searchTerm, mode: "insensitive" } },
			{ phone: { contains: searchTerm, mode: "insensitive" } },
			{ country: { contains: searchTerm, mode: "insensitive" } },
			{ id: { contains: searchTerm, mode: "insensitive" } },
			{ user_id: { contains: searchTerm, mode: "insensitive" } },
		];
	}

	const [rows, total] = await prisma.$transaction([
		prisma.patient_profile.findMany({
			where,
			orderBy: {
				user: {
					created_at: "desc",
				},
			},
			skip,
			take: pageSize,
			include: {
				user: {
					select: {
						id: true,
						created_at: true,
						_count: {
							select: {
								mediccal_cases: true,
							},
						},
					},
				},
			},
		}),
		prisma.patient_profile.count({ where }),
	]);

	const items: AdminPatientListItem[] = rows.map((row) => ({
		profile_id: row.id,
		user_id: row.user_id,
		name: row.name,
		email: row.email,
		account_status: "active",
		join_date: row.user.created_at,
		cases_count: row.user._count.mediccal_cases,
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

export interface PatientRegistrySummary {
	active_patients: number;
	urgent_cases: number;
	pending_reviews: number;
}

export const getPatientRegistrySummaryForAdmin =
	async (): Promise<PatientRegistrySummary> => {
		const [activePatients, urgentCases, pendingReviews] =
			await prisma.$transaction([
				prisma.patient_profile.count(),
				prisma.medical_case.count({
					where: { conversation_status: "in_progress" },
				}),
				prisma.file.count({
					where: {
						processing_status: {
							in: ["pending", "processing"],
						},
					},
				}),
			]);

		return {
			active_patients: activePatients,
			urgent_cases: urgentCases,
			pending_reviews: pendingReviews,
		};
	};
