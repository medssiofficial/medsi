import { prisma } from "../client";
import type {
	FileProcessingStataus,
	PatientFileProcessingLogOutcome,
	PatientFileProcessingSource,
} from "../types/server";
import type { Prisma } from "../types/server";

const truncateError = (message: string, max = 4000) => {
	if (message.length <= max) return message;
	return `${message.slice(0, max)}…`;
};

export type PatientFileProcessingLockRow = {
	id: string;
	filename: string;
	mime_type: string;
	report_type: "text_report" | "image_report";
	storage_key: string;
	metadata: Prisma.JsonValue | null;
	processing_status: FileProcessingStataus;
	user_id: string;
	user: {
		id: string;
		profile: { email: string; name: string } | null;
	};
};

export type PreparePatientFileProcessingResult =
	| { status: "missing" }
	| { status: "image_not_supported" }
	| { status: "skipped"; reason: "already_processing" | "wrong_status" | "not_text_report" }
	| { status: "ready"; file: PatientFileProcessingLockRow };

interface PreparePatientFileProcessingArgs {
	file_id: string;
	source: PatientFileProcessingSource;
	trigger_run_id?: string | null;
}

export const preparePatientFileForProcessing = async (
	args: PreparePatientFileProcessingArgs,
): Promise<PreparePatientFileProcessingResult> => {
	const file = await prisma.file.findUnique({
		where: { id: args.file_id },
		include: {
			user: {
				select: {
					id: true,
					profile: { select: { email: true, name: true } },
				},
			},
		},
	});

	if (!file) return { status: "missing" };

	if (file.report_type === "image_report") {
		await prisma.file.update({
			where: { id: args.file_id },
			data: {
				processing_status: "not_supported",
				processed_data: {
					version: 1,
					reason: "image_report_not_supported",
				} satisfies Prisma.InputJsonValue as Prisma.InputJsonValue,
			},
		});

		await prisma.patient_file_processing_log.create({
			data: {
				file_id: args.file_id,
				source: args.source,
				outcome: "skipped",
				error_message: null,
				gemini_model: null,
				trigger_run_id: args.trigger_run_id ?? null,
				metadata: { reason: "image_report" },
			},
		});

		return { status: "image_not_supported" };
	}

	if (file.report_type !== "text_report") {
		return { status: "skipped", reason: "not_text_report" };
	}

	if (file.processing_status === "processing") {
		return { status: "skipped", reason: "already_processing" };
	}

	if (file.processing_status !== "pending" && file.processing_status !== "failed") {
		return { status: "skipped", reason: "wrong_status" };
	}

	const locked = await prisma.file.updateMany({
		where: {
			id: args.file_id,
			report_type: "text_report",
			processing_status: { in: ["pending", "failed"] },
		},
		data: { processing_status: "processing" },
	});

	if (locked.count === 0) {
		return { status: "skipped", reason: "already_processing" };
	}

	const refreshed = await prisma.file.findUnique({
		where: { id: args.file_id },
		include: {
			user: {
				select: {
					id: true,
					profile: { select: { email: true, name: true } },
				},
			},
		},
	});

	if (!refreshed) return { status: "missing" };

	return {
		status: "ready",
		file: refreshed as PatientFileProcessingLockRow,
	};
};

interface CompletePatientFileProcessingArgs {
	file_id: string;
	processed_data: Prisma.InputJsonValue;
	gemini_model: string;
	source: PatientFileProcessingSource;
	trigger_run_id?: string | null;
	metadata?: Record<string, unknown> | null;
}

export const completePatientFileProcessing = async (
	args: CompletePatientFileProcessingArgs,
) => {
	await prisma.file.update({
		where: { id: args.file_id },
		data: {
			processing_status: "completed",
			processed_data: args.processed_data,
		},
	});

	await prisma.patient_file_processing_log.create({
		data: {
			file_id: args.file_id,
			source: args.source,
			outcome: "success",
			error_message: null,
			gemini_model: args.gemini_model,
			trigger_run_id: args.trigger_run_id ?? null,
			metadata: (args.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
		},
	});
};

interface FailPatientFileProcessingArgs {
	file_id: string;
	error_message: string;
	source: PatientFileProcessingSource;
	trigger_run_id?: string | null;
	gemini_model?: string | null;
	metadata?: Record<string, unknown> | null;
}

export const failPatientFileProcessing = async (args: FailPatientFileProcessingArgs) => {
	await prisma.file.update({
		where: { id: args.file_id },
		data: { processing_status: "failed" },
	});

	await prisma.patient_file_processing_log.create({
		data: {
			file_id: args.file_id,
			source: args.source,
			outcome: "failure",
			error_message: truncateError(args.error_message),
			gemini_model: args.gemini_model ?? null,
			trigger_run_id: args.trigger_run_id ?? null,
			metadata: (args.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
		},
	});
};

interface AppendPatientFileProcessingLogArgs {
	file_id: string;
	source: PatientFileProcessingSource;
	outcome: PatientFileProcessingLogOutcome;
	error_message?: string | null;
	gemini_model?: string | null;
	trigger_run_id?: string | null;
	metadata?: Record<string, unknown> | null;
}

export const appendPatientFileProcessingLog = async (
	args: AppendPatientFileProcessingLogArgs,
) => {
	return prisma.patient_file_processing_log.create({
		data: {
			file_id: args.file_id,
			source: args.source,
			outcome: args.outcome,
			error_message: args.error_message
				? truncateError(args.error_message)
				: null,
			gemini_model: args.gemini_model ?? null,
			trigger_run_id: args.trigger_run_id ?? null,
			metadata: (args.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
		},
	});
};

interface ListPatientFileProcessingLogsForPatientArgs {
	user_id: string;
	page: number;
	page_size: number;
}

export const listPatientFileProcessingLogsForPatient = async (
	args: ListPatientFileProcessingLogsForPatientArgs,
) => {
	const page = Math.max(1, args.page);
	const pageSize = Math.max(1, Math.min(50, args.page_size));
	const skip = (page - 1) * pageSize;

	const where: Prisma.patient_file_processing_logWhereInput = {
		file: { user_id: args.user_id },
	};

	const [items, total] = await prisma.$transaction([
		prisma.patient_file_processing_log.findMany({
			where,
			orderBy: { created_at: "desc" },
			skip,
			take: pageSize,
			include: {
				file: {
					select: {
						id: true,
						filename: true,
						report_type: true,
						processing_status: true,
					},
				},
			},
		}),
		prisma.patient_file_processing_log.count({ where }),
	]);

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

interface ListPatientFileProcessingLogsForAdminArgs {
	page: number;
	page_size: number;
}

export const listPatientFileProcessingLogsForAdmin = async (
	args: ListPatientFileProcessingLogsForAdminArgs,
) => {
	const page = Math.max(1, args.page);
	const pageSize = Math.max(1, Math.min(50, args.page_size));
	const skip = (page - 1) * pageSize;

	const [items, total] = await prisma.$transaction([
		prisma.patient_file_processing_log.findMany({
			orderBy: { created_at: "desc" },
			skip,
			take: pageSize,
			include: {
				file: {
					select: {
						id: true,
						filename: true,
						report_type: true,
						processing_status: true,
						user: {
							select: {
								id: true,
								profile: { select: { name: true, email: true } },
							},
						},
					},
				},
			},
		}),
		prisma.patient_file_processing_log.count(),
	]);

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

export const getTextReportFileIdsEligibleForBulkByUserId = async (user_id: string) => {
	const rows = await prisma.file.findMany({
		where: {
			user_id,
			report_type: "text_report",
			processing_status: { in: ["pending", "failed"] },
		},
		select: { id: true },
	});

	return rows.map((r) => r.id);
};

interface FindPatientFileForAdminArgs {
	user_id: string;
	file_id: string;
}

export const findPatientFileForAdmin = async (args: FindPatientFileForAdminArgs) => {
	return prisma.file.findFirst({
		where: {
			id: args.file_id,
			user_id: args.user_id,
		},
		select: {
			id: true,
			filename: true,
			report_type: true,
			processing_status: true,
		},
	});
};
