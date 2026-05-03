import { prisma } from "../client";
import type {
	DoctorEmbeddingLogOutcome,
	DoctorEmbeddingSource,
} from "../types/server";
import type { Prisma } from "../types/server";

const truncateError = (message: string, max = 4000) => {
	if (message.length <= max) return message;
	return `${message.slice(0, max)}…`;
};

interface SetDoctorEmbeddingPendingArgs {
	doctor_id: string;
	trigger_run_id?: string | null;
}

export const setDoctorEmbeddingPending = async (
	args: SetDoctorEmbeddingPendingArgs,
) => {
	return prisma.doctor_embedding_state.upsert({
		where: { doctor_id: args.doctor_id },
		create: {
			doctor_id: args.doctor_id,
			status: "pending",
			last_attempt_at: new Date(),
			last_trigger_run_id: args.trigger_run_id ?? null,
			last_error: null,
		},
		update: {
			status: "pending",
			last_attempt_at: new Date(),
			last_trigger_run_id: args.trigger_run_id ?? null,
			last_error: null,
		},
	});
};

interface MarkDoctorEmbeddingSyncedArgs {
	doctor_id: string;
	model: string;
	dimensions: number;
	trigger_run_id?: string | null;
}

export const markDoctorEmbeddingSynced = async (
	args: MarkDoctorEmbeddingSyncedArgs,
) => {
	return prisma.doctor_embedding_state.upsert({
		where: { doctor_id: args.doctor_id },
		create: {
			doctor_id: args.doctor_id,
			status: "synced",
			last_model: args.model,
			last_dimensions: args.dimensions,
			last_success_at: new Date(),
			last_attempt_at: new Date(),
			last_error: null,
			last_trigger_run_id: args.trigger_run_id ?? null,
		},
		update: {
			status: "synced",
			last_model: args.model,
			last_dimensions: args.dimensions,
			last_success_at: new Date(),
			last_attempt_at: new Date(),
			last_error: null,
			last_trigger_run_id: args.trigger_run_id ?? null,
		},
	});
};

interface MarkDoctorEmbeddingFailedArgs {
	doctor_id: string;
	error_message: string;
	trigger_run_id?: string | null;
}

export const markDoctorEmbeddingFailed = async (
	args: MarkDoctorEmbeddingFailedArgs,
) => {
	return prisma.doctor_embedding_state.upsert({
		where: { doctor_id: args.doctor_id },
		create: {
			doctor_id: args.doctor_id,
			status: "failed",
			last_attempt_at: new Date(),
			last_error: truncateError(args.error_message),
			last_trigger_run_id: args.trigger_run_id ?? null,
		},
		update: {
			status: "failed",
			last_attempt_at: new Date(),
			last_error: truncateError(args.error_message),
			last_trigger_run_id: args.trigger_run_id ?? null,
		},
	});
};

interface AppendDoctorEmbeddingLogArgs {
	doctor_id: string;
	source: DoctorEmbeddingSource;
	outcome: DoctorEmbeddingLogOutcome;
	error_message?: string | null;
	embedding_model?: string | null;
	dimensions?: number | null;
	trigger_run_id?: string | null;
	metadata?: Record<string, unknown> | null;
}

export const appendDoctorEmbeddingLog = async (
	args: AppendDoctorEmbeddingLogArgs,
) => {
	return prisma.doctor_embedding_log.create({
		data: {
			doctor_id: args.doctor_id,
			source: args.source,
			outcome: args.outcome,
			error_message: args.error_message
				? truncateError(args.error_message)
				: null,
			embedding_model: args.embedding_model ?? null,
			dimensions: args.dimensions ?? null,
			trigger_run_id: args.trigger_run_id ?? null,
			metadata: (args.metadata ?? undefined) as
				| Prisma.InputJsonValue
				| undefined,
		},
	});
};

interface ListDoctorEmbeddingLogsForAdminArgs {
	page: number;
	page_size: number;
}

export const listDoctorEmbeddingLogsForAdmin = async (
	args: ListDoctorEmbeddingLogsForAdminArgs,
) => {
	const page = Math.max(1, args.page);
	const pageSize = Math.max(1, Math.min(50, args.page_size));
	const skip = (page - 1) * pageSize;

	const [items, total] = await prisma.$transaction([
		prisma.doctor_embedding_log.findMany({
			orderBy: { created_at: "desc" },
			skip,
			take: pageSize,
			include: {
				doctor: {
					select: {
						id: true,
						profile: { select: { name: true, email: true } },
					},
				},
			},
		}),
		prisma.doctor_embedding_log.count(),
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

export const getVerifiedDoctorIdsEligibleForBulkEmbed = async () => {
	const rows = await prisma.doctor.findMany({
		where: {
			verified: true,
			profile: { isNot: null },
			OR: [
				{ embedding_state: null },
				{
					embedding_state: {
						status: { in: ["not_embedded", "failed"] },
					},
				},
			],
		},
		select: { id: true },
	});

	return rows.map((r) => r.id);
};
