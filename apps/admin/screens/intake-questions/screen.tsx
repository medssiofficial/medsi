"use client";

import { AdminShell } from "@/components/common/admin-shell";
import { Button } from "@repo/ui/components/ui/button";
import { Plus } from "lucide-react";
import { IntakeQuestionFormDialog, IntakeQuestionsTable } from "./components";
import { useIntakeQuestionsScreen } from "./hook";

const IntakeQuestionsScreen = () => {
	const {
		page,
		setPage,
		intakeQuestions,
		meta,
		isLoading,
		isRefreshing,
		isFormDialogOpen,
		editingQuestion,
		openCreateDialog,
		openEditDialog,
		closeFormDialog,
	} = useIntakeQuestionsScreen();

	return (
		<AdminShell>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">
							Intake Questions
						</h1>
						<p className="text-sm text-muted-foreground">
							Manage the intake questions shown to patients.
						</p>
					</div>
					<Button onClick={openCreateDialog}>
						<Plus className="mr-2 h-4 w-4" />
						Add Question
					</Button>
				</div>

				<IntakeQuestionsTable
					items={intakeQuestions}
					isLoading={isLoading}
					isRefreshing={isRefreshing}
					page={page}
					pageSize={meta.page_size}
					total={meta.total}
					totalPages={meta.total_pages}
					hasNextPage={meta.has_next_page}
					hasPreviousPage={meta.has_previous_page}
					onPageChange={setPage}
					onEdit={openEditDialog}
				/>

				<IntakeQuestionFormDialog
					open={isFormDialogOpen}
					onOpenChange={(open) => {
						if (!open) closeFormDialog();
					}}
					question={editingQuestion}
					onSuccess={closeFormDialog}
				/>
			</div>
		</AdminShell>
	);
};

export default IntakeQuestionsScreen;
