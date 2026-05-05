import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "../../http-error";

interface UpdateIntakeQuestionArgs {
	id: string;
	question_text?: string;
	response_type?: "text" | "file";
	is_active?: boolean;
}

export const updateIntakeQuestion = async (
	args: UpdateIntakeQuestionArgs,
): Promise<void> => {
	const { id, ...body } = args;

	const response = await fetch(
		`${API_ROUTES.ADMIN.INTAKE_QUESTIONS.UPDATE.path}/${id}`,
		{
			method: API_ROUTES.ADMIN.INTAKE_QUESTIONS.UPDATE.method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		},
	);

	const json = (await response.json()) as unknown;
	if (!response.ok) {
		throw new HttpError({
			status: response.status,
			message:
				typeof json === "object" &&
				json !== null &&
				"error" in json &&
				typeof (json as { error?: unknown }).error === "string"
					? (json as { error: string }).error
					: response.statusText,
		});
	}
};

export const useUpdateIntakeQuestionMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.ADMIN.INTAKE_QUESTIONS.UPDATE.key],
		mutationFn: updateIntakeQuestion,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.ADMIN.INTAKE_QUESTIONS.LIST.key],
			});
		},
	});
};
