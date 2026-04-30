import { prisma } from "../client";
import type { Prisma } from "../types/server";
import {
	getDefaultStorageBucket,
	getSupabaseAnonClient,
	uploadPublicFile,
} from "@repo/supabase";

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

interface GetPatientFileFoldersForAdminArgs {
	page: number;
	page_size: number;
	search?: string;
}

export interface AdminPatientFileFolderItem {
	profile_id: string;
	user_id: string;
	name: string;
	email: string;
	file_count: number;
	last_file_at: Date | null;
}

export const getPatientFileFoldersForAdmin = async (
	args: GetPatientFileFoldersForAdminArgs,
) => {
	const page = Math.max(1, args.page);
	const pageSize = Math.max(1, Math.min(50, args.page_size));
	const skip = (page - 1) * pageSize;
	const where: Prisma.patient_profileWhereInput = {};
	const searchTerm = args.search?.trim();

	if (searchTerm) {
		where.OR = [
			{ name: { contains: searchTerm, mode: "insensitive" } },
			{ email: { contains: searchTerm, mode: "insensitive" } },
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
						files: {
							select: { created_at: true },
							orderBy: { created_at: "desc" },
							take: 1,
						},
						_count: {
							select: { files: true },
						},
					},
				},
			},
		}),
		prisma.patient_profile.count({ where }),
	]);

	const items: AdminPatientFileFolderItem[] = rows.map((row) => ({
		profile_id: row.id,
		user_id: row.user_id,
		name: row.name,
		email: row.email,
		file_count: row.user._count.files,
		last_file_at: row.user.files[0]?.created_at ?? null,
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

interface GetPatientFilesForAdminByUserIdArgs {
	user_id: string;
}

export interface AdminPatientFolderFileItem {
	id: string;
	filename: string;
	mime_type: string;
	report_type: "text_report" | "image_report";
	processing_status: "pending" | "processing" | "completed" | "failed";
	created_at: Date;
	public_url: string | null;
}

export const getPatientFilesForAdminByUserId = async (
	args: GetPatientFilesForAdminByUserIdArgs,
) => {
	const patient = await prisma.patient_profile.findUnique({
		where: {
			user_id: args.user_id,
		},
		select: {
			user_id: true,
			name: true,
			email: true,
		},
	});

	if (!patient) return null;

	const files = await prisma.file.findMany({
		where: {
			user_id: args.user_id,
		},
		orderBy: {
			created_at: "desc",
		},
	});

	return {
		patient: {
			user_id: patient.user_id,
			name: patient.name,
			email: patient.email,
		},
		files: files.map((file) => ({
			id: file.id,
			filename: file.filename,
			mime_type: file.mime_type,
			report_type: file.report_type,
			processing_status: file.processing_status,
			created_at: file.created_at,
			public_url: resolvePublicUrlFromStorageKey(file.storage_key),
		} satisfies AdminPatientFolderFileItem)),
	};
};

const DEFAULT_LIST_LIMIT = 12;
const MAX_LIST_LIMIT = 30;

const normalizeListLimit = (value?: number) => {
	if (!value) return DEFAULT_LIST_LIMIT;
	return Math.max(1, Math.min(MAX_LIST_LIMIT, value));
};

const getPatientUserByClerkId = async (clerk_id: string) => {
	return prisma.user.findUnique({
		where: { clerk_id },
		select: { id: true },
	});
};

export interface PatientCaseListItem {
	id: string;
	conversation_status: "in_progress" | "completed" | "cancelled";
	summary: string | null;
	created_at: Date;
	updated_at: Date;
	file_count: number;
}

export interface CursorPageResult<TItem> {
	items: TItem[];
	next_cursor: string | null;
	has_more: boolean;
}

interface GetPatientCasesByClerkIdArgs {
	clerk_id: string;
	limit?: number;
	cursor?: string;
	search?: string;
}

export const getPatientCasesByClerkId = async (
	args: GetPatientCasesByClerkIdArgs,
): Promise<CursorPageResult<PatientCaseListItem>> => {
	const patient = await getPatientUserByClerkId(args.clerk_id);
	if (!patient) return { items: [], next_cursor: null, has_more: false };

	const limit = normalizeListLimit(args.limit);
	const searchTerm = args.search?.trim();
	const where: Prisma.medical_caseWhereInput = {
		user_id: patient.id,
	};

	if (searchTerm) {
		where.OR = [
			{ id: { contains: searchTerm, mode: "insensitive" } },
			{ summary: { contains: searchTerm, mode: "insensitive" } },
		];
	}

	const rows = await prisma.medical_case.findMany({
		where,
		orderBy: { id: "desc" },
		take: limit + 1,
		...(args.cursor
			? {
					skip: 1,
					cursor: { id: args.cursor },
				}
			: {}),
		include: {
			_count: { select: { files: true } },
		},
	});

	const hasMore = rows.length > limit;
	const slicedRows = hasMore ? rows.slice(0, limit) : rows;

	return {
		items: slicedRows.map((row) => ({
			id: row.id,
			conversation_status: row.conversation_status,
			summary: row.summary,
			created_at: row.created_at,
			updated_at: row.updated_at,
			file_count: row._count.files,
		})),
		next_cursor: hasMore ? slicedRows[slicedRows.length - 1]?.id ?? null : null,
		has_more: hasMore,
	};
};

export interface PatientFileListItem {
	id: string;
	filename: string;
	mime_type: string;
	report_type: "text_report" | "image_report";
	processing_status: "pending" | "processing" | "completed" | "failed";
	created_at: Date;
	public_url: string | null;
	related_case_ids: string[];
	used_in_cases_count: number;
}

const toPatientReportType = (
	mimeType: string,
): "text_report" | "image_report" => {
	return mimeType.toLowerCase().startsWith("image/")
		? "image_report"
		: "text_report";
};

const resolvePublicUrlFromStorageKey = (storageKey: string) => {
	const bucket = getDefaultStorageBucket();
	const supabase = getSupabaseAnonClient();

	if (!bucket || !supabase) return null;

	return supabase.storage.from(bucket).getPublicUrl(storageKey).data.publicUrl;
};

interface GetPatientFilesByClerkIdArgs {
	clerk_id: string;
	limit?: number;
	cursor?: string;
	search?: string;
}

export const getPatientFilesByClerkId = async (
	args: GetPatientFilesByClerkIdArgs,
): Promise<CursorPageResult<PatientFileListItem>> => {
	const patient = await getPatientUserByClerkId(args.clerk_id);
	if (!patient) return { items: [], next_cursor: null, has_more: false };

	const limit = normalizeListLimit(args.limit);
	const searchTerm = args.search?.trim();
	const where: Prisma.fileWhereInput = {
		user_id: patient.id,
	};

	if (searchTerm) {
		const reportTypeCandidate =
			searchTerm.toLowerCase() === "text_report" ||
			searchTerm.toLowerCase() === "image_report"
				? (searchTerm.toLowerCase() as "text_report" | "image_report")
				: null;

		where.OR = [
			{ filename: { contains: searchTerm, mode: "insensitive" } },
			...(reportTypeCandidate ? [{ report_type: reportTypeCandidate }] : []),
			{
				case_references: {
					some: {
						medical_case_id: { contains: searchTerm, mode: "insensitive" },
					},
				},
			},
		];
	}

	const rows = await prisma.file.findMany({
		where,
		orderBy: { id: "desc" },
		take: limit + 1,
		...(args.cursor
			? {
					skip: 1,
					cursor: { id: args.cursor },
				}
			: {}),
		include: {
			case_references: {
				select: {
					medical_case_id: true,
				},
			},
		},
	});

	const hasMore = rows.length > limit;
	const slicedRows = hasMore ? rows.slice(0, limit) : rows;

	return {
		items: slicedRows.map((row) => ({
			id: row.id,
			filename: row.filename,
			mime_type: row.mime_type,
			report_type: row.report_type,
			processing_status: row.processing_status,
			created_at: row.created_at,
			public_url: resolvePublicUrlFromStorageKey(row.storage_key),
			related_case_ids: row.case_references.map((r) => r.medical_case_id),
			used_in_cases_count: row.case_references.length,
		})),
		next_cursor: hasMore ? slicedRows[slicedRows.length - 1]?.id ?? null : null,
		has_more: hasMore,
	};
};

interface UploadPatientFileByClerkIdArgs {
	clerk_id: string;
	file: File;
}

export const uploadPatientFileByClerkId = async (
	args: UploadPatientFileByClerkIdArgs,
) => {
	const patient = await getPatientUserByClerkId(args.clerk_id);
	if (!patient) {
		throw new Error("Patient not found.");
	}

	const originalName = args.file.name?.trim() || `upload-${Date.now()}.bin`;
	const mimeType = args.file.type?.trim() || "application/octet-stream";
	const reportType = toPatientReportType(mimeType);

	const uploadResult = await uploadPublicFile({
		file: args.file,
		fileName: originalName,
		folder: `patient_${patient.id}`,
		contentType: mimeType,
	});

	if (!uploadResult.success) {
		throw new Error(uploadResult.error);
	}

	const fileRow = await prisma.file.create({
		data: {
			filename: originalName,
			mime_type: mimeType,
			report_type: reportType,
			storage_key: uploadResult.data.path,
			processing_status: "pending",
			user_id: patient.id,
			metadata: {
				public_url: uploadResult.data.publicUrl,
				size: uploadResult.data.size,
				uploaded_at: uploadResult.data.uploadedAt,
				bucket: uploadResult.data.bucket,
			},
		},
	});

	return {
		id: fileRow.id,
		filename: fileRow.filename,
		mime_type: fileRow.mime_type,
		report_type: fileRow.report_type,
		processing_status: fileRow.processing_status,
		created_at: fileRow.created_at,
		public_url: uploadResult.data.publicUrl,
		related_case_ids: [] as string[],
		used_in_cases_count: 0,
	};
};

export interface PatientChatListItem {
	id: string;
	status: "in_progress" | "completed" | "cancelled";
	preview: string;
	updated_at: Date;
}

interface GetPatientChatsByClerkIdArgs {
	clerk_id: string;
	limit?: number;
	cursor?: string;
	search?: string;
}

export const getPatientChatsByClerkId = async (
	args: GetPatientChatsByClerkIdArgs,
): Promise<CursorPageResult<PatientChatListItem>> => {
	const cases = await getPatientCasesByClerkId({
		clerk_id: args.clerk_id,
		limit: args.limit,
		cursor: args.cursor,
		search: args.search,
	});

	return {
		items: cases.items.map((item) => ({
			id: item.id,
			status: item.conversation_status,
			preview: item.summary?.trim() || "Conversation in progress...",
			updated_at: item.updated_at,
		})),
		next_cursor: cases.next_cursor,
		has_more: cases.has_more,
	};
};

export interface PatientDashboardOverview {
	active_cases: number;
	completed_cases: number;
	has_ongoing_case: boolean;
	recent_cases: PatientCaseListItem[];
}

interface GetPatientDashboardOverviewByClerkIdArgs {
	clerk_id: string;
}

export const getPatientDashboardOverviewByClerkId = async (
	args: GetPatientDashboardOverviewByClerkIdArgs,
): Promise<PatientDashboardOverview> => {
	const patient = await getPatientUserByClerkId(args.clerk_id);

	if (!patient) {
		return {
			active_cases: 0,
			completed_cases: 0,
			has_ongoing_case: false,
			recent_cases: [],
		};
	}

	const [activeCases, completedCases, recentCases] = await prisma.$transaction([
		prisma.medical_case.count({
			where: {
				user_id: patient.id,
				conversation_status: "in_progress",
			},
		}),
		prisma.medical_case.count({
			where: {
				user_id: patient.id,
				conversation_status: "completed",
			},
		}),
		prisma.medical_case.findMany({
			where: { user_id: patient.id },
			orderBy: { id: "desc" },
			take: 5,
			include: {
				_count: { select: { files: true } },
			},
		}),
	]);

	return {
		active_cases: activeCases,
		completed_cases: completedCases,
		has_ongoing_case: activeCases > 0,
		recent_cases: recentCases.map((row) => ({
			id: row.id,
			conversation_status: row.conversation_status,
			summary: row.summary,
			created_at: row.created_at,
			updated_at: row.updated_at,
			file_count: row._count.files,
		})),
	};
};
