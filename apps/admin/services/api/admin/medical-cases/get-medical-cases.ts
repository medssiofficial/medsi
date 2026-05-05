import { API_ROUTES } from "@/config/client-constants";
import { useQuery } from "@tanstack/react-query";
import type { JsonApiResponse } from "@repo/types/api";
import { HttpError } from "../../http-error";

export type MedicalCaseListItem = {
	id: string;
	conversation_status: string;
	case_stage: string;
	summary: string | null;
	created_at: string | Date;
	updated_at: string | Date;
	user: {
		profile: {
			name: string | null;
			email: string | null;
		} | null;
	};
	_count: {
		files: number;
		chat_messages: number;
	};
};

export type MedicalCasesListResult = {
	cases: MedicalCaseListItem[];
	meta: {
		total: number;
		page: number;
		page_size: number;
		total_pages: number;
		has_next_page: boolean;
		has_previous_page: boolean;
	};
};

type ApiSuccess = JsonApiResponse<MedicalCasesListResult>;

const normalizeMedicalCaseListItem = (
	item: Record<string, unknown>,
): MedicalCaseListItem => {
	const rawUser = (item.user as Record<string, unknown> | undefined) ?? undefined;
	const rawProfile =
		(rawUser?.profile as Record<string, unknown> | undefined) ?? undefined;
	const rawCount = (item._count as Record<string, unknown> | undefined) ?? undefined;

	return {
		id: String(item.id ?? ""),
		conversation_status: String(item.conversation_status ?? "in_progress"),
		case_stage: String(item.case_stage ?? "chatting"),
		summary: (item.summary as string | null | undefined) ?? null,
		created_at: (item.created_at as string | Date | undefined) ?? new Date(),
		updated_at: (item.updated_at as string | Date | undefined) ?? new Date(),
		user: {
			profile: {
				name: (rawProfile?.name as string | null | undefined) ?? (item.patient_name as string | null | undefined) ?? null,
				email:
					(rawProfile?.email as string | null | undefined) ??
					(item.patient_email as string | null | undefined) ??
					null,
			},
		},
		_count: {
			files:
				(rawCount?.files as number | undefined) ??
				(item.file_count as number | undefined) ??
				0,
			chat_messages:
				(rawCount?.chat_messages as number | undefined) ??
				(item.message_count as number | undefined) ??
				0,
		},
	};
};

const normalizeMedicalCasesListResult = (
	result: MedicalCasesListResult,
): MedicalCasesListResult => {
	const normalizedCases = Array.isArray(result.cases)
		? result.cases.map((caseItem) =>
				normalizeMedicalCaseListItem(caseItem as unknown as Record<string, unknown>),
			)
		: [];

	return {
		cases: normalizedCases,
		meta: result.meta,
	};
};

export interface GetMedicalCasesArgs {
	page: number;
	page_size: number;
	search?: string;
	stage?: string;
	status?: string;
}

export const getMedicalCases = async (
	args: GetMedicalCasesArgs,
): Promise<MedicalCasesListResult> => {
	const query = new URLSearchParams({
		page: String(args.page),
		page_size: String(args.page_size),
	});

	if (args.search?.trim()) {
		query.set("search", args.search.trim());
	}

	if (args.stage?.trim()) {
		query.set("stage", args.stage.trim());
	}

	if (args.status?.trim()) {
		query.set("status", args.status.trim());
	}

	const response = await fetch(
		`${API_ROUTES.ADMIN.MEDICAL_CASES.LIST.path}?${query.toString()}`,
		{
			method: API_ROUTES.ADMIN.MEDICAL_CASES.LIST.method,
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
		return normalizeMedicalCasesListResult(apiJson.data as MedicalCasesListResult);
	}

	throw new Error("Invalid response.");
};

export const useMedicalCasesQuery = (args: GetMedicalCasesArgs) => {
	return useQuery({
		queryKey: [
			API_ROUTES.ADMIN.MEDICAL_CASES.LIST.key,
			args.page,
			args.page_size,
			args.search ?? "",
			args.stage ?? "",
			args.status ?? "",
		],
		queryFn: () => getMedicalCases(args),
		placeholderData: (previous) => previous,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};
