import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { uploadPatientFileByClerkId } from "@repo/database/actions/patient";
import { HttpError } from "../http-error";

export type UploadedPatientFile = Awaited<
	ReturnType<typeof uploadPatientFileByClerkId>
>;

export const uploadPatientFile = async (
	file: File,
): Promise<UploadedPatientFile> => {
	const formData = new FormData();
	formData.set("file", file);

	const response = await fetch(API_ROUTES.PATIENT.FILES_UPLOAD.path, {
		method: API_ROUTES.PATIENT.FILES_UPLOAD.method,
		body: formData,
	});

	let json: unknown = null;
	try {
		json = (await response.json()) as unknown;
	} catch {
		json = null;
	}

	if (!response.ok) {
		let message = response.statusText;
		if (
			typeof json === "object" &&
			json !== null &&
			"error" in json &&
			typeof (json as { error?: unknown }).error === "string"
		) {
			message = (json as { error: string }).error;
		}
		throw new HttpError({
			status: response.status,
			message,
		});
	}

	if (
		typeof json === "object" &&
		json !== null &&
		"data" in json &&
		typeof (json as { data?: unknown }).data === "object" &&
		(json as { data: { file?: UploadedPatientFile } }).data?.file
	) {
		return (json as { data: { file: UploadedPatientFile } }).data.file;
	}

	throw new Error("Invalid response.");
};

export const useUploadPatientFileMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: [API_ROUTES.PATIENT.FILES_UPLOAD.key],
		mutationFn: uploadPatientFile,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.FILES.key],
			});
		},
	});
};
