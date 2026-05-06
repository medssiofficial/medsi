import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";

export type ChatMessage = {
	id: string;
	role: string;
	content: string;
	created_at: string | Date;
	metadata: Record<string, unknown> | null;
};

export type CaseFile = {
	id: string;
	file_name: string;
	file_type: string;
	file_key: string;
	processing_status: string;
	created_at: string | Date;
};

export type CaseAnalysis = {
	id: string;
	detected_specialty: string | null;
	urgency_level: string | null;
	ai_confidence: number | null;
	key_symptoms: string[] | null;
	summary: string | null;
	created_at: string | Date;
};

export type EventLog = {
	id: string;
	event_type: string;
	metadata: Record<string, unknown> | null;
	created_at: string | Date;
};

export type MedicalCaseDetail = {
	id: string;
	user_id: string;
	conversation_status: string;
	case_stage: string;
	language: string;
	summary: string | null;
	info_state: Record<string, unknown> | null;
	created_at: string | Date;
	updated_at: string | Date;
	user: {
		profile: {
			name: string | null;
			email: string | null;
		} | null;
	};
	chat_messages: ChatMessage[];
	files: CaseFile[];
	analysis: CaseAnalysis | null;
	event_logs: EventLog[];
};

type ApiSuccess = JsonApiResponse<{ medical_case: MedicalCaseDetail }>;

const normalizeMedicalCaseDetail = (
	value: MedicalCaseDetail,
): MedicalCaseDetail => {
	const files = Array.isArray((value as { files?: unknown }).files)
		? ((value as { files: Array<Record<string, unknown>> }).files ?? []).map(
				(caseFile) => {
					const nestedFile =
						(caseFile.file as Record<string, unknown> | undefined) ?? undefined;
					return {
						id: String(caseFile.id ?? nestedFile?.id ?? ""),
						file_name: String(
							caseFile.file_name ?? nestedFile?.filename ?? "Untitled file",
						),
						file_type: String(
							caseFile.file_type ?? nestedFile?.mime_type ?? "unknown",
						),
						file_key: String(
							caseFile.file_key ?? nestedFile?.storage_key ?? "",
						),
						processing_status: String(
							caseFile.processing_status ??
								nestedFile?.processing_status ??
								"pending",
						),
						created_at:
							(caseFile.created_at as string | Date | undefined) ??
							(nestedFile?.created_at as string | Date | undefined) ??
							new Date().toISOString(),
					};
				},
			)
		: [];

	return {
		...value,
		chat_messages: Array.isArray(value.chat_messages) ? value.chat_messages : [],
		event_logs: Array.isArray(value.event_logs) ? value.event_logs : [],
		files,
	};
};

export const getMedicalCaseDetail = async (args: {
	case_id: string;
}): Promise<MedicalCaseDetail> => {
	const response = await fetch(
		`${API_ROUTES.ADMIN.MEDICAL_CASES.DETAIL.path}/${args.case_id}`,
		{
			method: API_ROUTES.ADMIN.MEDICAL_CASES.DETAIL.method,
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
		typeof apiJson.data === "object" &&
		"medical_case" in apiJson.data
	) {
		return normalizeMedicalCaseDetail(
			(apiJson.data as { medical_case: MedicalCaseDetail }).medical_case,
		);
	}

	throw new Error("Invalid response.");
};

const PROCESSING_POLL_MS = 5000;

export const useMedicalCaseDetailQuery = (args: {
	case_id: string | null;
	enabled?: boolean;
}) => {
	return useQuery({
		queryKey: [API_ROUTES.ADMIN.MEDICAL_CASES.DETAIL.key, args.case_id],
		queryFn: () =>
			getMedicalCaseDetail({
				case_id: args.case_id ?? "",
			}),
		enabled: Boolean(args.case_id) && (args.enabled ?? true),
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 0,
		refetchInterval: (query) => {
			const medicalCase = query.state.data;
			return medicalCase?.case_stage === "processing"
				? PROCESSING_POLL_MS
				: false;
		},
	});
};
