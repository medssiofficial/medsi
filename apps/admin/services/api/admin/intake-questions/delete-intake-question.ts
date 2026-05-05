import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "../../http-error";

interface DeleteIntakeQuestionArgs {
	id: string;
}

export const deleteIntakeQuestion = async (
	args: DeleteIntakeQuestionArgs,
): Promise<void> => {
	const response = await fetch(
		`${API_ROUTES.ADMIN.INTAKE_QUESTIONS.DELETE.path}/${args.id}`,
		{
			method: API_ROUTES.ADMIN.INTAKE_QUESTIONS.DELETE.method,
			headers: { "Content-Type": "application/json" },
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

export const useDeleteIntakeQuestionMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.ADMIN.INTAKE_QUESTIONS.DELETE.key],
		mutationFn: deleteIntakeQuestion,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.ADMIN.INTAKE_QUESTIONS.LIST.key],
			});
		},
	});
};
