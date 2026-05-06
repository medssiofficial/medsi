import { prisma } from "../client";
import type { CaseEventType, Prisma } from "../types/server";

const truncateError = (message: string, max = 4000) => {
	if (message.length <= max) return message;
	return `${message.slice(0, max)}…`;
};

// ---------------------------------------------------------------------------
// Case Lifecycle
// ---------------------------------------------------------------------------

interface CreateMedicalCaseArgs {
	user_id: string;
	language?: string;
}

export const createMedicalCase = async (args: CreateMedicalCaseArgs) => {
	const firstQuestion = await prisma.intake_question.findFirst({
		where: { is_active: true },
		orderBy: { order: "asc" },
	});

	return prisma.medical_case.create({
		data: {
			user_id: args.user_id,
			language: args.language ?? "English",
			case_stage: "chatting",
			conversation_status: "in_progress",
			info_state: {
				create: {
					current_question_id: firstQuestion?.id ?? null,
					current_question_index: 0,
					collected_fields: {},
					off_topic_streak: 0,
				},
			},
			event_logs: {
				create: {
					event_type: "case_created",
				},
			},
		},
		include: {
			info_state: true,
		},
	});
};

interface GetMedicalCaseDetailArgs {
	case_id: string;
	user_id?: string;
}

export const getMedicalCaseDetail = async (args: GetMedicalCaseDetailArgs) => {
	const where: Prisma.medical_caseWhereUniqueInput = { id: args.case_id };

	const medicalCase = await prisma.medical_case.findUnique({
		where,
		include: {
			info_state: {
				include: {
					question: true,
				},
			},
			analysis: true,
			embedding_state: true,
			files: {
				include: {
					file: true,
				},
			},
			chat_messages: {
				orderBy: { created_at: "asc" },
			},
			_count: {
				select: { event_logs: true },
			},
		},
	});

	if (!medicalCase) return null;
	if (args.user_id && medicalCase.user_id !== args.user_id) return null;

	return {
		...medicalCase,
		event_count: medicalCase._count.event_logs,
	};
};

interface GetMedicalCaseForProcessingArgs {
	case_id: string;
}

export const getMedicalCaseForProcessing = async (
	args: GetMedicalCaseForProcessingArgs,
) => {
	return prisma.medical_case.findUnique({
		where: { id: args.case_id },
		include: {
			chat_messages: {
				orderBy: { created_at: "asc" },
			},
			files: {
				include: {
					file: {
						select: {
							id: true,
							filename: true,
							mime_type: true,
							report_type: true,
							processing_status: true,
							storage_key: true,
							processed_data: true,
						},
					},
				},
			},
			user: {
				include: {
					profile: {
						select: { name: true, age: true, gender: true, email: true, country: true },
					},
				},
			},
		},
	});
};

interface UpdateCaseStageArgs {
	case_id: string;
	stage: "chatting" | "processing" | "analyzed" | "ready_for_matching";
}

export const updateCaseStage = async (args: UpdateCaseStageArgs) => {
	return prisma.medical_case.update({
		where: { id: args.case_id },
		data: { case_stage: args.stage },
	});
};

interface CompleteCaseChatArgs {
	case_id: string;
	collected_data: Record<string, unknown>;
}

export const completeCaseChat = async (args: CompleteCaseChatArgs) => {
	return prisma.medical_case.update({
		where: { id: args.case_id },
		data: {
			conversation_status: "completed",
			case_stage: "processing",
			collected_data: args.collected_data as Prisma.InputJsonValue,
			event_logs: {
				create: {
					event_type: "chat_completed",
				},
			},
		},
	});
};

interface CancelCaseChatArgs {
	case_id: string;
	reason?: string;
}

export const cancelCaseChat = async (args: CancelCaseChatArgs) => {
	return prisma.medical_case.update({
		where: { id: args.case_id },
		data: {
			conversation_status: "cancelled",
			case_stage: "chatting",
			event_logs: {
				create: {
					event_type: "chat_cancelled",
					metadata: args.reason
						? ({ reason: args.reason } as Prisma.InputJsonValue)
						: undefined,
				},
			},
		},
	});
};

// ---------------------------------------------------------------------------
// Chat Messages
// ---------------------------------------------------------------------------

interface AppendChatMessageArgs {
	case_id: string;
	role: "assistant" | "user";
	content: string;
	file_id?: string;
	question_id?: string;
	metadata?: Record<string, unknown>;
}

export const appendChatMessage = async (args: AppendChatMessageArgs) => {
	const eventType: CaseEventType = args.file_id
		? "file_attached"
		: args.role === "assistant"
			? "question_asked"
			: "answer_received";

	const [message] = await prisma.$transaction([
		prisma.case_chat_message.create({
			data: {
				case_id: args.case_id,
				role: args.role,
				content: args.content,
				file_id: args.file_id ?? null,
				question_id: args.question_id ?? null,
				metadata: (args.metadata ?? undefined) as
					| Prisma.InputJsonValue
					| undefined,
			},
		}),
		prisma.case_event_log.create({
			data: {
				case_id: args.case_id,
				event_type: eventType,
			},
		}),
	]);

	return message;
};

interface GetCaseMessagesArgs {
	case_id: string;
	user_id?: string;
}

export const getCaseMessages = async (args: GetCaseMessagesArgs) => {
	if (args.user_id) {
		const medicalCase = await prisma.medical_case.findUnique({
			where: { id: args.case_id },
			select: { user_id: true },
		});
		if (!medicalCase || medicalCase.user_id !== args.user_id) return null;
	}

	return prisma.case_chat_message.findMany({
		where: { case_id: args.case_id },
		orderBy: { created_at: "asc" },
	});
};

// ---------------------------------------------------------------------------
// Case Info State
// ---------------------------------------------------------------------------

interface AdvanceCaseQuestionArgs {
	case_id: string;
	collected_field_key: string;
	collected_field_value: unknown;
}

export const advanceCaseQuestion = async (args: AdvanceCaseQuestionArgs) => {
	const infoState = await prisma.case_info_state.findUnique({
		where: { case_id: args.case_id },
	});

	if (!infoState) {
		throw new Error(`Info state not found for case ${args.case_id}`);
	}

	const existingFields =
		(infoState.collected_fields as Record<string, unknown>) ?? {};
	const mergedFields = {
		...existingFields,
		[args.collected_field_key]: args.collected_field_value,
	};
	const nextIndex = infoState.current_question_index + 1;

	const nextQuestion = await prisma.intake_question.findFirst({
		where: { is_active: true },
		orderBy: { order: "asc" },
		skip: nextIndex,
	});

	await prisma.case_info_state.update({
		where: { case_id: args.case_id },
		data: {
			collected_fields: mergedFields as Prisma.InputJsonValue,
			current_question_index: nextIndex,
			current_question_id: nextQuestion?.id ?? null,
			off_topic_streak: 0,
		},
	});

	return {
		has_more_questions: nextQuestion !== null,
		next_question: nextQuestion
			? {
					id: nextQuestion.id,
					question_text: nextQuestion.question_text,
					response_type: nextQuestion.response_type,
				}
			: null,
		collected_fields: mergedFields,
	};
};

interface IncrementOffTopicStreakArgs {
	case_id: string;
}

export const incrementOffTopicStreak = async (
	args: IncrementOffTopicStreakArgs,
) => {
	const [infoState] = await prisma.$transaction([
		prisma.case_info_state.update({
			where: { case_id: args.case_id },
			data: {
				off_topic_streak: { increment: 1 },
			},
		}),
		prisma.medical_case.update({
			where: { id: args.case_id },
			data: {
				off_topic_count: { increment: 1 },
			},
		}),
		prisma.case_event_log.create({
			data: {
				case_id: args.case_id,
				event_type: "off_topic_warning",
			},
		}),
	]);

	return { off_topic_streak: infoState.off_topic_streak };
};

interface IncrementCaseQuestionRetryArgs {
	case_id: string;
	question_key: string;
	latest_answer?: string;
	latest_clarity?: "clear" | "partial" | "unclear";
	detected_problem_type?: string | null;
}

export const incrementCaseQuestionRetry = async (
	args: IncrementCaseQuestionRetryArgs,
) => {
	const infoState = await prisma.case_info_state.findUnique({
		where: { case_id: args.case_id },
	});

	if (!infoState) {
		throw new Error(`Info state not found for case ${args.case_id}`);
	}

	const existingFields =
		(infoState.collected_fields as Record<string, unknown>) ?? {};
	const rawMeta = existingFields.__question_meta;
	const questionMeta = (
		typeof rawMeta === "object" && rawMeta !== null ? rawMeta : {}
	) as Record<string, unknown>;
	const current = questionMeta[args.question_key];
	const currentRecord =
		typeof current === "object" && current !== null
			? (current as Record<string, unknown>)
			: {};
	const currentRetry =
		typeof currentRecord.retry_count === "number"
			? currentRecord.retry_count
			: 0;
	const nextRetry = currentRetry + 1;

	const nextQuestionMeta: Record<string, unknown> = {
		...questionMeta,
		[args.question_key]: {
			...currentRecord,
			retry_count: nextRetry,
			last_answer: args.latest_answer ?? null,
			last_clarity: args.latest_clarity ?? null,
			updated_at: new Date().toISOString(),
		},
	};

	if (args.detected_problem_type && args.detected_problem_type.trim().length > 0) {
		nextQuestionMeta.__detected_problem_type = args.detected_problem_type.trim();
	}

	const mergedFields = {
		...existingFields,
		__question_meta: nextQuestionMeta,
	};

	await prisma.case_info_state.update({
		where: { case_id: args.case_id },
		data: {
			collected_fields: mergedFields as Prisma.InputJsonValue,
		},
	});

	return { retry_count: nextRetry, collected_fields: mergedFields };
};

// ---------------------------------------------------------------------------
// Case Files
// ---------------------------------------------------------------------------

interface AttachFileToCaseArgs {
	case_id: string;
	file_id: string;
}

export const attachFileToCase = async (args: AttachFileToCaseArgs) => {
	const [caseFile] = await prisma.$transaction([
		prisma.case_file.create({
			data: {
				medical_case_id: args.case_id,
				file_id: args.file_id,
			},
		}),
		prisma.case_event_log.create({
			data: {
				case_id: args.case_id,
				event_type: "file_attached",
				metadata: { file_id: args.file_id } as Prisma.InputJsonValue,
			},
		}),
	]);

	return caseFile;
};

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

interface SaveCaseAnalysisArgs {
	case_id: string;
	detected_specialty?: string;
	urgency_level?: string;
	ai_confidence?: number;
	key_symptoms?: unknown;
	ai_summary?: string;
	collected_information?: unknown;
	gemini_model?: string;
	trigger_run_id?: string;
	metadata?: Record<string, unknown>;
}

export const saveCaseAnalysis = async (args: SaveCaseAnalysisArgs) => {
	const data = {
		detected_specialty: args.detected_specialty ?? null,
		urgency_level: args.urgency_level ?? null,
		ai_confidence: args.ai_confidence ?? null,
		key_symptoms: (args.key_symptoms ?? undefined) as
			| Prisma.InputJsonValue
			| undefined,
		ai_summary: args.ai_summary ?? null,
		collected_information: (args.collected_information ?? undefined) as
			| Prisma.InputJsonValue
			| undefined,
		gemini_model: args.gemini_model ?? null,
		trigger_run_id: args.trigger_run_id ?? null,
		metadata: (args.metadata ?? undefined) as
			| Prisma.InputJsonValue
			| undefined,
	};

	const [analysis] = await prisma.$transaction([
		prisma.case_analysis.upsert({
			where: { case_id: args.case_id },
			create: { case_id: args.case_id, ...data },
			update: data,
		}),
		prisma.medical_case.update({
			where: { id: args.case_id },
			data: {
				case_stage: "analyzed",
				summary: args.ai_summary ?? undefined,
			},
		}),
		prisma.case_event_log.create({
			data: {
				case_id: args.case_id,
				event_type: "analysis_completed",
			},
		}),
	]);

	return analysis;
};

interface FailCaseAnalysisArgs {
	case_id: string;
	error_message: string;
	trigger_run_id?: string;
}

export const failCaseAnalysis = async (args: FailCaseAnalysisArgs) => {
	await prisma.$transaction([
		prisma.case_event_log.create({
			data: {
				case_id: args.case_id,
				event_type: "analysis_failed",
				metadata: {
					error: truncateError(args.error_message),
					trigger_run_id: args.trigger_run_id ?? null,
				} as Prisma.InputJsonValue,
			},
		}),
		prisma.medical_case.update({
			where: { id: args.case_id },
			data: { case_stage: "processing" },
		}),
	]);
};

// ---------------------------------------------------------------------------
// Embedding State
// ---------------------------------------------------------------------------

interface SetCaseEmbeddingPendingArgs {
	case_id: string;
	trigger_run_id?: string;
}

export const setCaseEmbeddingPending = async (
	args: SetCaseEmbeddingPendingArgs,
) => {
	return prisma.case_embedding_state.upsert({
		where: { case_id: args.case_id },
		create: {
			case_id: args.case_id,
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

interface MarkCaseEmbeddingSyncedArgs {
	case_id: string;
	model: string;
	dimensions: number;
	trigger_run_id?: string;
}

export const markCaseEmbeddingSynced = async (
	args: MarkCaseEmbeddingSyncedArgs,
) => {
	const [embeddingState] = await prisma.$transaction([
		prisma.case_embedding_state.upsert({
			where: { case_id: args.case_id },
			create: {
				case_id: args.case_id,
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
		}),
		prisma.case_event_log.create({
			data: {
				case_id: args.case_id,
				event_type: "embedding_generated",
			},
		}),
	]);

	return embeddingState;
};

interface MarkCaseEmbeddingFailedArgs {
	case_id: string;
	error_message: string;
	trigger_run_id?: string;
}

export const markCaseEmbeddingFailed = async (
	args: MarkCaseEmbeddingFailedArgs,
) => {
	return prisma.case_embedding_state.upsert({
		where: { case_id: args.case_id },
		create: {
			case_id: args.case_id,
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

// ---------------------------------------------------------------------------
// Event Logs
// ---------------------------------------------------------------------------

interface AppendCaseEventLogArgs {
	case_id: string;
	event_type: CaseEventType;
	metadata?: Record<string, unknown>;
}

export const appendCaseEventLog = async (args: AppendCaseEventLogArgs) => {
	return prisma.case_event_log.create({
		data: {
			case_id: args.case_id,
			event_type: args.event_type,
			metadata: (args.metadata ?? undefined) as
				| Prisma.InputJsonValue
				| undefined,
		},
	});
};

interface ListCaseEventLogsArgs {
	case_id: string;
	page: number;
	page_size: number;
}

export const listCaseEventLogs = async (args: ListCaseEventLogsArgs) => {
	const page = Math.max(1, args.page);
	const pageSize = Math.max(1, Math.min(50, args.page_size));
	const skip = (page - 1) * pageSize;

	const [items, total] = await prisma.$transaction([
		prisma.case_event_log.findMany({
			where: { case_id: args.case_id },
			orderBy: { created_at: "desc" },
			skip,
			take: pageSize,
		}),
		prisma.case_event_log.count({
			where: { case_id: args.case_id },
		}),
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

// ---------------------------------------------------------------------------
// Admin Queries
// ---------------------------------------------------------------------------

interface ListMedicalCasesForAdminArgs {
	page: number;
	page_size: number;
	search?: string;
	stage?: string;
	status?: string;
}

export interface AdminMedicalCaseListItem {
	id: string;
	patient_name: string | null;
	patient_email: string | null;
	conversation_status: string;
	case_stage: string;
	file_count: number;
	message_count: number;
	created_at: Date;
	updated_at: Date;
}

export const listMedicalCasesForAdmin = async (
	args: ListMedicalCasesForAdminArgs,
) => {
	const page = Math.max(1, args.page);
	const pageSize = Math.max(1, Math.min(50, args.page_size));
	const skip = (page - 1) * pageSize;

	const where: Prisma.medical_caseWhereInput = {};
	const searchTerm = args.search?.trim();

	if (searchTerm) {
		where.OR = [
			{ id: { contains: searchTerm, mode: "insensitive" } },
			{ summary: { contains: searchTerm, mode: "insensitive" } },
			{
				user: {
					profile: {
						OR: [
							{ name: { contains: searchTerm, mode: "insensitive" } },
							{ email: { contains: searchTerm, mode: "insensitive" } },
						],
					},
				},
			},
		];
	}

	if (args.stage) {
		where.case_stage = args.stage as Prisma.medical_caseWhereInput["case_stage"];
	}

	if (args.status) {
		where.conversation_status =
			args.status as Prisma.medical_caseWhereInput["conversation_status"];
	}

	const [rows, total] = await prisma.$transaction([
		prisma.medical_case.findMany({
			where,
			orderBy: { created_at: "desc" },
			skip,
			take: pageSize,
			include: {
				user: {
					include: {
						profile: {
							select: { name: true, email: true },
						},
					},
				},
				_count: {
					select: { files: true, chat_messages: true },
				},
			},
		}),
		prisma.medical_case.count({ where }),
	]);

	const items: AdminMedicalCaseListItem[] = rows.map((row) => ({
		id: row.id,
		patient_name: row.user.profile?.name ?? null,
		patient_email: row.user.profile?.email ?? null,
		conversation_status: row.conversation_status,
		case_stage: row.case_stage,
		file_count: row._count.files,
		message_count: row._count.chat_messages,
		created_at: row.created_at,
		updated_at: row.updated_at,
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

interface GetMedicalCaseDetailForAdminArgs {
	case_id: string;
}

export const getMedicalCaseDetailForAdmin = async (
	args: GetMedicalCaseDetailForAdminArgs,
) => {
	return prisma.medical_case.findUnique({
		where: { id: args.case_id },
		include: {
			user: {
				include: {
					profile: true,
				},
			},
			info_state: true,
			analysis: true,
			files: {
				include: { file: true },
			},
			chat_messages: {
				orderBy: { created_at: "asc" },
			},
			event_logs: {
				orderBy: { created_at: "desc" },
				take: 50,
			},
			embedding_state: true,
			_count: {
				select: {
					event_logs: true,
					files: true,
					chat_messages: true,
				},
			},
		},
	});
};
