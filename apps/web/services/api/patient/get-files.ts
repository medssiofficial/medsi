import { API_ROUTES } from "@/config/client-constants";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { getPatientFilesByClerkId } from "@repo/database/actions/patient";
import { HttpError } from "../http-error";

export type PatientFilesPage = Awaited<ReturnType<typeof getPatientFilesByClerkId>>;

const DEFAULT_LIMIT = 12;

export const getPatientFiles = async (args: {
	cursor?: string;
	search?: string;
	limit?: number;
}): Promise<PatientFilesPage> => {
	const query = new URLSearchParams();
	query.set("limit", String(args.limit ?? DEFAULT_LIMIT));
	if (args.cursor) query.set("cursor", args.cursor);
	if (args.search?.trim()) query.set("search", args.search.trim());

	const response = await fetch(
		`${API_ROUTES.PATIENT.FILES.path}?${query.toString()}`,
		{
			method: API_ROUTES.PATIENT.FILES.method,
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
		return (json as { data: PatientFilesPage }).data;
	}

	throw new Error("Invalid response.");
};

export const usePatientFilesInfinite = (args?: {
	search?: string;
	enabled?: boolean;
}) => {
	return useInfiniteQuery({
		queryKey: [API_ROUTES.PATIENT.FILES.key, args?.search ?? ""],
		queryFn: ({ pageParam }) =>
			getPatientFiles({
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
