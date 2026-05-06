import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";

export type IntakeQuestionListItem = {
	id: string;
	question_text: string;
	response_type: "text" | "file";
	is_active: boolean;
	order: number;
	created_at: string | Date;
	updated_at: string | Date;
};

type IntakeQuestionsListResult = {
	intake_questions: IntakeQuestionListItem[];
	meta: {
		total: number;
		page: number;
		page_size: number;
		total_pages: number;
		has_next_page: boolean;
		has_previous_page: boolean;
	};
};

type ApiSuccess = JsonApiResponse<IntakeQuestionsListResult>;

export interface GetAdminIntakeQuestionsArgs {
	page: number;
	page_size: number;
}

export const getAdminIntakeQuestions = async (
	args: GetAdminIntakeQuestionsArgs,
): Promise<IntakeQuestionsListResult> => {
	const query = new URLSearchParams({
		page: String(args.page),
		page_size: String(args.page_size),
	});

	const response = await fetch(
		`${API_ROUTES.ADMIN.INTAKE_QUESTIONS.LIST.path}?${query.toString()}`,
		{
			method: API_ROUTES.ADMIN.INTAKE_QUESTIONS.LIST.method,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	let json: unknown = null;
	try {
		json = (await response.json()) as unknown;
	} catch {
		json = null;
	}

	if (!response.ok) {
		let message = response.statusText;
		if (typeof json === "object" && json !== null) {
			if (
				"error" in json &&
				typeof (json as { error?: unknown }).error === "string"
			) {
				message = (json as { error: string }).error;
			} else if (
				"message" in json &&
				typeof (json as { message?: unknown }).message === "string"
			) {
				message = (json as { message: string }).message;
			}
		}
		throw new HttpError({ status: response.status, message });
	}

	const apiJson = json as ApiSuccess;
	if (
		apiJson &&
		typeof apiJson === "object" &&
		"success" in apiJson &&
		apiJson.success === true &&
		apiJson.data &&
		typeof apiJson.data === "object"
	) {
		return apiJson.data as IntakeQuestionsListResult;
	}

	throw new Error("Invalid response.");
};

export const useIntakeQuestionsQuery = (args: GetAdminIntakeQuestionsArgs) => {
	return useQuery({
		queryKey: [
			API_ROUTES.ADMIN.INTAKE_QUESTIONS.LIST.key,
			args.page,
			args.page_size,
		],
		queryFn: () => getAdminIntakeQuestions(args),
		placeholderData: (previous) => previous,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};

export type { IntakeQuestionsListResult };
