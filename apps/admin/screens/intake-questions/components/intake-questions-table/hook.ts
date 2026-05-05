"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useDeleteIntakeQuestionMutation } from "@/services/api/admin/intake-questions/delete-intake-question";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

const MAX_PAGE_BUTTONS = 5;

export const useIntakeQuestionsTable = (args: {
	currentPage: number;
	totalPages: number;
}) => {
	const { currentPage, totalPages } = args;
	const { APIErrorHandler } = useAPIErrorHandler();
	const deleteMutation = useDeleteIntakeQuestionMutation();

	const [deletingId, setDeletingId] = useState<string | null>(null);

	const pageNumbers = useMemo(() => {
		if (totalPages <= MAX_PAGE_BUTTONS) {
			return Array.from({ length: totalPages }, (_, index) => index + 1);
		}

		const start = Math.max(1, currentPage - 2);
		const end = Math.min(totalPages, start + MAX_PAGE_BUTTONS - 1);
		const adjustedStart = Math.max(1, end - MAX_PAGE_BUTTONS + 1);

		return Array.from(
			{ length: end - adjustedStart + 1 },
			(_, index) => adjustedStart + index,
		);
	}, [currentPage, totalPages]);

	const handleDelete = useCallback(
		(id: string) => {
			setDeletingId(id);
			deleteMutation.mutate(
				{ id },
				{
					onSuccess: () => {
						toast.success("Question deleted successfully.");
						setDeletingId(null);
					},
					onError: (error) => {
						APIErrorHandler()(error);
						setDeletingId(null);
					},
				},
			);
		},
		[deleteMutation, APIErrorHandler],
	);

	return {
		pageNumbers,
		deletingId,
		handleDelete,
	};
};
