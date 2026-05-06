import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "../../http-error";

interface CreateIntakeQuestionArgs {
	question_text: string;
	response_type: "text" | "file";
}

export const createIntakeQuestion = async (
	args: CreateIntakeQuestionArgs,
): Promise<void> => {
	const response = await fetch(API_ROUTES.ADMIN.INTAKE_QUESTIONS.CREATE.path, {
		method: API_ROUTES.ADMIN.INTAKE_QUESTIONS.CREATE.method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(args),
	});

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

export const useCreateIntakeQuestionMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.ADMIN.INTAKE_QUESTIONS.CREATE.key],
		mutationFn: createIntakeQuestion,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.ADMIN.INTAKE_QUESTIONS.LIST.key],
			});
		},
	});
};
