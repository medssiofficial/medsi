import { prisma } from "../client";

interface ListIntakeQuestionsArgs {
	active_only?: boolean;
}

export const listIntakeQuestions = async (args: ListIntakeQuestionsArgs) => {
	return prisma.intake_question.findMany({
		where: args.active_only ? { is_active: true } : undefined,
		orderBy: { order: "asc" },
	});
};

interface ListIntakeQuestionsForAdminArgs {
	page: number;
	page_size: number;
}

export const listIntakeQuestionsForAdmin = async (
	args: ListIntakeQuestionsForAdminArgs,
) => {
	const page = Math.max(1, args.page);
	const pageSize = Math.max(1, Math.min(50, args.page_size));
	const skip = (page - 1) * pageSize;

	const [items, total] = await prisma.$transaction([
		prisma.intake_question.findMany({
			orderBy: { order: "asc" },
			skip,
			take: pageSize,
		}),
		prisma.intake_question.count(),
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

interface CreateIntakeQuestionArgs {
	question_text: string;
	response_type: "text" | "file";
}

export const createIntakeQuestion = async (args: CreateIntakeQuestionArgs) => {
	const maxOrderResult = await prisma.intake_question.aggregate({
		_max: { order: true },
	});
	const nextOrder = (maxOrderResult._max.order ?? 0) + 1;

	return prisma.intake_question.create({
		data: {
			question_text: args.question_text,
			response_type: args.response_type,
			order: nextOrder,
		},
	});
};

interface UpdateIntakeQuestionArgs {
	id: string;
	question_text?: string;
	response_type?: "text" | "file";
	is_active?: boolean;
}

export const updateIntakeQuestion = async (args: UpdateIntakeQuestionArgs) => {
	const { id, ...fields } = args;

	return prisma.intake_question.update({
		where: { id },
		data: {
			...(fields.question_text !== undefined && {
				question_text: fields.question_text,
			}),
			...(fields.response_type !== undefined && {
				response_type: fields.response_type,
			}),
			...(fields.is_active !== undefined && {
				is_active: fields.is_active,
			}),
		},
	});
};

interface DeleteIntakeQuestionArgs {
	id: string;
}

export const deleteIntakeQuestion = async (args: DeleteIntakeQuestionArgs) => {
	return prisma.intake_question.delete({
		where: { id: args.id },
	});
};

interface ReorderIntakeQuestionsArgs {
	ordered_ids: string[];
}

export const reorderIntakeQuestions = async (
	args: ReorderIntakeQuestionsArgs,
) => {
	const updates = args.ordered_ids.map((id, index) =>
		prisma.intake_question.update({
			where: { id },
			data: { order: index },
		}),
	);

	return prisma.$transaction(updates);
};
