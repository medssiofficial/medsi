import { API_ROUTES } from "@/config/client-constants";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { getPatientCasesByClerkId } from "@repo/database/actions/patient";
import { HttpError } from "../http-error";

export type PatientCasesPage = Awaited<ReturnType<typeof getPatientCasesByClerkId>>;

const DEFAULT_LIMIT = 12;

export const getPatientCases = async (args: {
	cursor?: string;
	search?: string;
	limit?: number;
}): Promise<PatientCasesPage> => {
	const query = new URLSearchParams();
	query.set("limit", String(args.limit ?? DEFAULT_LIMIT));
	if (args.cursor) query.set("cursor", args.cursor);
	if (args.search?.trim()) query.set("search", args.search.trim());

	const response = await fetch(
		`${API_ROUTES.PATIENT.CASES.path}?${query.toString()}`,
		{
			method: API_ROUTES.PATIENT.CASES.method,
			headers: { "Content-Type": "application/json" },
		},
	);

	let json: unknown = null;
	try {
		json = (await response.json()) as unknown;
	} catch {
		json = null;
	}

	if (!response.ok) {
		throw new HttpError({
			status: response.status,
			message: response.statusText,
		});
	}

	if (
		typeof json === "object" &&
		json !== null &&
		"data" in json &&
		typeof (json as { data?: unknown }).data === "object"
	) {
		return (json as { data: PatientCasesPage }).data;
	}

	throw new Error("Invalid response.");
};

export const usePatientCasesInfinite = (args?: {
	search?: string;
	enabled?: boolean;
}) => {
	return useInfiniteQuery({
		queryKey: [API_ROUTES.PATIENT.CASES.key, args?.search ?? ""],
		queryFn: ({ pageParam }) =>
			getPatientCases({
				cursor: pageParam ?? undefined,
				search: args?.search,
			}),
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) =>
			lastPage.has_more ? lastPage.next_cursor : undefined,
		enabled: args?.enabled ?? true,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 60 * 1000,
	});
};
