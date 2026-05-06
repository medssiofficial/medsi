"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import type { IntakeQuestionListItem } from "@/services/api/admin/intake-questions/get-intake-questions";
import { useCreateIntakeQuestionMutation } from "@/services/api/admin/intake-questions/create-intake-question";
import { useUpdateIntakeQuestionMutation } from "@/services/api/admin/intake-questions/update-intake-question";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useIntakeQuestionFormDialog = (args: {
	question: IntakeQuestionListItem | null;
	onSuccess: () => void;
}) => {
	const { question, onSuccess } = args;
	const { APIErrorHandler } = useAPIErrorHandler();

	const createMutation = useCreateIntakeQuestionMutation();
	const updateMutation = useUpdateIntakeQuestionMutation();

	const isEditMode = question !== null;
	const [questionTextDraft, setQuestionTextDraft] = useState<string | null>(null);
	const [responseTypeDraft, setResponseTypeDraft] = useState<"text" | "file" | null>(
		null,
	);
	const [isActiveDraft, setIsActiveDraft] = useState<boolean | null>(null);
	const [draftQuestionId, setDraftQuestionId] = useState<string | null>(null);

	const currentQuestionId = question?.id ?? null;
	const isSameQuestionDraft = draftQuestionId === currentQuestionId;
	const questionText = isSameQuestionDraft
		? (questionTextDraft ?? (question?.question_text ?? ""))
		: (question?.question_text ?? "");
	const responseType = isSameQuestionDraft
		? (responseTypeDraft ?? (question?.response_type ?? "text"))
		: (question?.response_type ?? "text");
	const isActive = isSameQuestionDraft
		? (isActiveDraft ?? (question?.is_active ?? true))
		: (question?.is_active ?? true);

	const setQuestionText = useCallback(
		(value: string) => {
			setDraftQuestionId(currentQuestionId);
			setQuestionTextDraft(value);
		},
		[currentQuestionId],
	);

	const setResponseType = useCallback(
		(value: "text" | "file") => {
			setDraftQuestionId(currentQuestionId);
			setResponseTypeDraft(value);
		},
		[currentQuestionId],
	);

	const setIsActive = useCallback(
		(value: boolean) => {
			setDraftQuestionId(currentQuestionId);
			setIsActiveDraft(value);
		},
		[currentQuestionId],
	);

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	const canSubmit = questionText.trim().length > 0 && !isSubmitting;
	const resetDraft = () => {
		setDraftQuestionId(null);
		setQuestionTextDraft(null);
		setResponseTypeDraft(null);
		setIsActiveDraft(null);
	};

	const handleSubmit = useCallback(() => {
		if (!canSubmit) return;

		if (isEditMode && question) {
			updateMutation.mutate(
				{
					id: question.id,
					question_text: questionText.trim(),
					response_type: responseType,
					is_active: isActive,
				},
				{
					onSuccess: () => {
						resetDraft();
						toast.success("Question updated successfully.");
						onSuccess();
					},
					onError: (error) => {
						APIErrorHandler()(error);
					},
				},
			);
		} else {
			createMutation.mutate(
				{
					question_text: questionText.trim(),
					response_type: responseType,
				},
				{
					onSuccess: () => {
						resetDraft();
						toast.success("Question created successfully.");
						onSuccess();
					},
					onError: (error) => {
						APIErrorHandler()(error);
					},
				},
			);
		}
	}, [
		canSubmit,
		isEditMode,
		question,
		questionText,
		responseType,
		isActive,
		createMutation,
		updateMutation,
		onSuccess,
		APIErrorHandler,
	]);

	return {
		isEditMode,
		questionText,
		setQuestionText,
		responseType,
		setResponseType,
		isActive,
		setIsActive,
		isSubmitting,
		canSubmit,
		handleSubmit,
	};
};
