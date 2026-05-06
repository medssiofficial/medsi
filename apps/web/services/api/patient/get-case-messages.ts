import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";

export interface CaseMessage {
	id: string;
	role: "assistant" | "user";
	content: string;
	file_id: string | null;
	question_id: string | null;
	created_at: string;
}

const getCaseMessages = async (
	caseId: string,
): Promise<{ messages: CaseMessage[] }> => {
	const response = await fetch(
		`${API_ROUTES.PATIENT.CASES.path}/${caseId}/messages`,
	);
	const json = await response.json();
	if (!response.ok || !json.success) {
		throw new Error(json.error ?? "Failed to fetch messages.");
	}
	return json.data;
};

export const useCaseMessagesQuery = (args: {
	caseId: string | null;
	enabled?: boolean;
}) => {
	return useQuery({
		queryKey: [API_ROUTES.PATIENT.CASES.key, "messages", args.caseId],
		queryFn: () => getCaseMessages(args.caseId!),
		enabled: Boolean(args.caseId) && (args.enabled ?? true),
		staleTime: 0,
	});
};
