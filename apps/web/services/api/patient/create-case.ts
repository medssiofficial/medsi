import { API_ROUTES } from "@/config/client-constants";
import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateCaseResponse {
	case: {
		id: string;
		case_stage: string;
		conversation_status: string;
		info_state: {
			current_question_index: number;
			current_question_id: string | null;
		} | null;
	};
}

const createCase = async (): Promise<CreateCaseResponse> => {
	const response = await fetch(API_ROUTES.PATIENT.CASES.path, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
	});

	const json = await response.json();
	if (!response.ok || !json.success) {
		throw new Error(json.error ?? "Failed to create case.");
	}

	return json.data;
};

export const useCreateCaseMutation = () => {
	const queryClient = useQueryClient();
	const { APIErrorHandler } = useAPIErrorHandler();

	return useMutation({
		mutationFn: createCase,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.CASES.key],
			});
		},
		onError: (error) => {
			APIErrorHandler()(error);
		},
	});
};
