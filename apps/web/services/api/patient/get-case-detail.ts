import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";

interface CaseAnalysis {
	id: string;
	detected_specialty: string | null;
	urgency_level: string | null;
	ai_confidence: number | null;
	key_symptoms: Array<{ description: string; severity: string }>;
	ai_summary: string | null;
	collected_information: Record<string, unknown> | null;
	gemini_model: string | null;
	created_at: string;
}

interface CaseFile {
	id: string;
	file_id: string;
	file: {
		id: string;
		filename: string;
		mime_type: string;
		report_type: string;
		processing_status: string;
	};
}

interface CaseMessage {
	id: string;
	role: "assistant" | "user";
	content: string;
	file_id: string | null;
	question_id: string | null;
	created_at: string;
}

interface CaseInfoState {
	current_question_index: number;
	current_question_id: string | null;
	off_topic_streak: number;
	collected_fields: Record<string, unknown>;
	question?: {
		id: string;
		question_text: string;
		response_type: "text" | "file";
	} | null;
}

export interface CaseDetailData {
	id: string;
	user_id: string;
	conversation_status: "in_progress" | "completed" | "cancelled";
	case_stage: "chatting" | "processing" | "analyzed" | "ready_for_matching";
	language: string;
	off_topic_count: number;
	collected_data: Record<string, unknown> | null;
	summary: string | null;
	created_at: string;
	updated_at: string;
	info_state: CaseInfoState | null;
	analysis: CaseAnalysis | null;
	files: CaseFile[];
	chat_messages: CaseMessage[];
	embedding_state: {
		status: string;
	} | null;
}

const getCaseDetail = async (caseId: string): Promise<CaseDetailData> => {
	const response = await fetch(`${API_ROUTES.PATIENT.CASES.path}/${caseId}`);
	const json = await response.json();
	if (!response.ok || !json.success) {
		throw new Error(json.error ?? "Failed to fetch case.");
	}
	return json.data;
};

export const useCaseDetailQuery = (args: {
	caseId: string | null;
	enabled?: boolean;
}) => {
	return useQuery({
		queryKey: [API_ROUTES.PATIENT.CASES.key, "detail", args.caseId],
		queryFn: () => getCaseDetail(args.caseId!),
		enabled: Boolean(args.caseId) && (args.enabled ?? true),
		staleTime: 0,
		refetchInterval: (query) => {
			const data = query.state.data;
			if (data?.case_stage === "processing") return 4000;
			return false;
		},
	});
};

export type { CaseAnalysis, CaseFile, CaseMessage, CaseInfoState };
