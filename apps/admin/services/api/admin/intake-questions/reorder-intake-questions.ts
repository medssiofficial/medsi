import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "../../http-error";

interface ReorderIntakeQuestionsArgs {
	ordered_ids: string[];
}

export const reorderIntakeQuestions = async (
	args: ReorderIntakeQuestionsArgs,
): Promise<void> => {
	const response = await fetch(
		API_ROUTES.ADMIN.INTAKE_QUESTIONS.REORDER.path,
		{
			method: API_ROUTES.ADMIN.INTAKE_QUESTIONS.REORDER.method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(args),
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

export const useReorderIntakeQuestionsMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.ADMIN.INTAKE_QUESTIONS.REORDER.key],
		mutationFn: reorderIntakeQuestions,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.ADMIN.INTAKE_QUESTIONS.LIST.key],
			});
		},
	});
};
