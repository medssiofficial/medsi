"use client";

import { useAPIErrorHandler } from "@/hooks/use-api-error-handler";
import { useIntakeQuestionsQuery } from "@/services/api/admin/intake-questions/get-intake-questions";
import type { IntakeQuestionListItem } from "@/services/api/admin/intake-questions/get-intake-questions";
import { useEffect, useState, useCallback } from "react";

const PAGE_SIZE = 20;

export const useIntakeQuestionsScreen = () => {
	const { APIErrorHandler } = useAPIErrorHandler();
	const [page, setPage] = useState(1);

	const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
	const [editingQuestion, setEditingQuestion] =
		useState<IntakeQuestionListItem | null>(null);

	const questionsQuery = useIntakeQuestionsQuery({
		page,
		page_size: PAGE_SIZE,
	});

	useEffect(() => {
		if (!questionsQuery.isError) return;
		APIErrorHandler()(questionsQuery.error);
	}, [APIErrorHandler, questionsQuery.error, questionsQuery.isError]);

	const intakeQuestions = questionsQuery.data?.intake_questions ?? [];
	const meta = questionsQuery.data?.meta ?? {
		total: 0,
		page: 1,
		page_size: PAGE_SIZE,
		total_pages: 1,
		has_next_page: false,
		has_previous_page: false,
	};

	const openCreateDialog = useCallback(() => {
		setEditingQuestion(null);
		setIsFormDialogOpen(true);
	}, []);

	const openEditDialog = useCallback((question: IntakeQuestionListItem) => {
		setEditingQuestion(question);
		setIsFormDialogOpen(true);
	}, []);

	const closeFormDialog = useCallback(() => {
		setIsFormDialogOpen(false);
		setEditingQuestion(null);
	}, []);

	return {
		page,
		setPage,
		intakeQuestions,
		meta,
		isLoading: questionsQuery.isLoading,
		isRefreshing: questionsQuery.isFetching && !questionsQuery.isLoading,
		isFormDialogOpen,
		editingQuestion,
		openCreateDialog,
		openEditDialog,
		closeFormDialog,
	};
};
