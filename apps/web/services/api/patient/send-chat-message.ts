import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ROUTES } from "@/config/client-constants";

interface SendChatMessageArgs {
	caseId: string;
	message?: string;
	file_id?: string;
	skip?: boolean;
}

interface ChatResponse {
	assistant_message: string;
	case_status: "in_progress" | "completed" | "cancelled";
	off_topic_warnings?: number;
	next_question: {
		id: string;
		question_text: string;
		response_type: "text" | "file";
	} | null;
}

const sendChatMessage = async (
	args: SendChatMessageArgs,
): Promise<ChatResponse> => {
	const response = await fetch(
		`${API_ROUTES.PATIENT.CASES.path}/${args.caseId}/chat`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: args.message,
				file_id: args.file_id,
				skip: args.skip,
			}),
		},
	);

	const json = await response.json();
	if (!response.ok || !json.success) {
		throw new Error(json.error ?? "Failed to send message.");
	}

	return json.data;
};

export const useSendChatMessageMutation = () => {
	const queryClient = useQueryClient();
	const { APIErrorHandler } = useAPIErrorHandler();

	return useMutation({
		mutationFn: sendChatMessage,
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({
				queryKey: [
					API_ROUTES.PATIENT.CASES.key,
					"detail",
					variables.caseId,
				],
			});
		},
		onError: (error) => {
			APIErrorHandler()(error);
		},
	});
};

export type { ChatResponse, SendChatMessageArgs };
