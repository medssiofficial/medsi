import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ROUTES } from "@/config/client-constants";

interface AttachExistingFileArgs {
	caseId: string;
	file_id: string;
}

interface UploadCaseFileArgs {
	caseId: string;
	file: File;
}

const attachExistingFile = async (args: AttachExistingFileArgs) => {
	const response = await fetch(
		`${API_ROUTES.PATIENT.CASES.path}/${args.caseId}/files`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ file_id: args.file_id }),
		},
	);

	const json = await response.json();
	if (!response.ok || !json.success) {
		throw new Error(json.error ?? "Failed to attach file.");
	}

	return json.data;
};

const uploadCaseFile = async (args: UploadCaseFileArgs) => {
	const formData = new FormData();
	formData.append("file", args.file);

	const response = await fetch(
		`${API_ROUTES.PATIENT.CASES.path}/${args.caseId}/files`,
		{
			method: "POST",
			body: formData,
		},
	);

	const json = await response.json();
	if (!response.ok || !json.success) {
		throw new Error(json.error ?? "Failed to upload file.");
	}

	return json.data;
};

export const useAttachExistingFileMutation = () => {
	const queryClient = useQueryClient();
	const { APIErrorHandler } = useAPIErrorHandler();

	return useMutation({
		mutationFn: attachExistingFile,
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({
				queryKey: [
					API_ROUTES.PATIENT.CASES.key,
					"detail",
					variables.caseId,
				],
			});
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.FILES.key],
			});
		},
		onError: (error) => {
			APIErrorHandler()(error);
		},
	});
};

export const useUploadCaseFileMutation = () => {
	const queryClient = useQueryClient();
	const { APIErrorHandler } = useAPIErrorHandler();

	return useMutation({
		mutationFn: uploadCaseFile,
		onSuccess: (_data, variables) => {
			void queryClient.invalidateQueries({
				queryKey: [
					API_ROUTES.PATIENT.CASES.key,
					"detail",
					variables.caseId,
				],
			});
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.FILES.key],
			});
		},
		onError: (error) => {
			APIErrorHandler()(error);
		},
	});
};
