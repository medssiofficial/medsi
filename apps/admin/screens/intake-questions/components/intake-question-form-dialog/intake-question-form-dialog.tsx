"use client";

import type { IntakeQuestionListItem } from "@/services/api/admin/intake-questions/get-intake-questions";
import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/ui/select";
import { Switch } from "@repo/ui/components/ui/switch";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useIntakeQuestionFormDialog } from "./hook";

interface IntakeQuestionFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	question: IntakeQuestionListItem | null;
	onSuccess: () => void;
}

export const IntakeQuestionFormDialog = (
	props: IntakeQuestionFormDialogProps,
) => {
	const { open, onOpenChange, question, onSuccess } = props;

	const {
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
	} = useIntakeQuestionFormDialog({ question, onSuccess });

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? "Edit Question" : "Add Question"}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<div className="space-y-2">
						<Label htmlFor="question-text">Question Text</Label>
						<Textarea
							id="question-text"
							placeholder="Enter the intake question..."
							value={questionText}
							onChange={(e) => setQuestionText(e.target.value)}
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="response-type">Response Type</Label>
						<Select
							value={responseType}
							onValueChange={(value) =>
								setResponseType(value as "text" | "file")
							}
						>
							<SelectTrigger id="response-type">
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="text">Text</SelectItem>
								<SelectItem value="file">File</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{isEditMode && (
						<div className="flex items-center justify-between">
							<Label htmlFor="is-active">Active</Label>
							<Switch
								id="is-active"
								checked={isActive}
								onCheckedChange={setIsActive}
							/>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!canSubmit}
					>
						{isSubmitting
							? isEditMode
								? "Updating..."
								: "Creating..."
							: isEditMode
								? "Update"
								: "Create"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
