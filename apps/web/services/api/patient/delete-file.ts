import { API_ROUTES } from "@/config/client-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HttpError } from "../http-error";

export const deletePatientFile = async (fileId: string): Promise<{ id: string }> => {
	const response = await fetch(`${API_ROUTES.PATIENT.FILE_DETAIL.path}/${fileId}`, {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
	});

	const json = (await response.json()) as unknown;
	if (!response.ok) {
		throw new HttpError({
			status: response.status,
			message:
				typeof json === "object" &&
				json !== null &&
				"error" in json &&
				typeof (json as { error?: unknown }).error === "string"
					? (json as { error: string }).error
					: response.statusText,
		});
	}

	const data = (json as { data?: { id?: unknown } }).data;
	if (data && typeof data.id === "string") {
		return { id: data.id };
	}

	throw new Error("Invalid response.");
};

export const useDeletePatientFileMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["patient.file.delete"],
		mutationFn: deletePatientFile,
		onSuccess: (_data, fileId) => {
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.FILES.key],
			});
			void queryClient.invalidateQueries({
				queryKey: [API_ROUTES.PATIENT.FILE_DETAIL.key, fileId],
			});
		},
	});
};
