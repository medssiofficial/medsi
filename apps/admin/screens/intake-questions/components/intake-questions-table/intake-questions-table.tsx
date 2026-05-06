"use client";

import type { IntakeQuestionListItem } from "@/services/api/admin/intake-questions/get-intake-questions";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Empty,
	EmptyHeader,
	EmptyTitle,
} from "@repo/ui/components/ui/empty";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@repo/ui/components/ui/pagination";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { useIntakeQuestionsTable } from "./hook";

interface IntakeQuestionsTableProps {
	items: IntakeQuestionListItem[];
	isLoading: boolean;
	isRefreshing: boolean;
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onPageChange: (page: number) => void;
	onEdit: (question: IntakeQuestionListItem) => void;
}

const TABLE_HEADERS = ["#", "Question Text", "Response Type", "Status", "Actions"];

export const IntakeQuestionsTable = (props: IntakeQuestionsTableProps) => {
	const {
		items,
		isLoading,
		isRefreshing,
		page,
		pageSize,
		total,
		totalPages,
		hasNextPage,
		hasPreviousPage,
		onPageChange,
		onEdit,
	} = props;

	const { pageNumbers, deletingId, handleDelete } = useIntakeQuestionsTable({
		currentPage: page,
		totalPages,
	});

	const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(total, page * pageSize);

	return (
		<div className="rounded-lg border bg-background">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/60">
						{TABLE_HEADERS.map((header) => (
							<TableHead key={header}>{header}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading ? (
						Array.from({ length: 6 }, (_, rowIndex) => (
							<TableRow key={rowIndex}>
								{Array.from({ length: TABLE_HEADERS.length }).map(
									(_, colIndex) => (
										<TableCell key={colIndex}>
											<Skeleton className="h-4 w-full max-w-28" />
										</TableCell>
									),
								)}
							</TableRow>
						))
					) : items.length === 0 ? (
						<TableRow>
							<TableCell colSpan={TABLE_HEADERS.length} className="p-0">
								<Empty className="rounded-none border-0 py-14">
									<EmptyHeader>
										<EmptyTitle>No records found.</EmptyTitle>
									</EmptyHeader>
								</Empty>
							</TableCell>
						</TableRow>
					) : (
						items.map((question) => (
							<TableRow key={question.id}>
								<TableCell className="w-16 tabular-nums text-muted-foreground">
									{question.order}
								</TableCell>
								<TableCell className="max-w-[400px] truncate font-medium">
									{question.question_text}
								</TableCell>
								<TableCell>
									<Badge variant="outline" className="capitalize">
										{question.response_type}
									</Badge>
								</TableCell>
								<TableCell>
									{question.is_active ? (
										<Badge
											variant="secondary"
											className="rounded-full bg-emerald-100 font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
										>
											Active
										</Badge>
									) : (
										<Badge
											variant="secondary"
											className="rounded-full bg-zinc-100 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
										>
											Inactive
										</Badge>
									)}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onEdit(question)}
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											disabled={deletingId === question.id}
											onClick={() => handleDelete(question.id)}
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			<div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
				<p className="text-sm text-muted-foreground">
					Showing {from}-{to} of {total} questions
					{isRefreshing && !isLoading ? " (refreshing...)" : ""}
				</p>

				<Pagination className="mx-0 w-auto justify-end">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href="#"
								onClick={(event) => {
									event.preventDefault();
									if (!hasPreviousPage) return;
									onPageChange(page - 1);
								}}
								aria-disabled={!hasPreviousPage}
								className={
									!hasPreviousPage ? "pointer-events-none opacity-50" : ""
								}
							/>
						</PaginationItem>

						{pageNumbers.map((pageNumber) => (
							<PaginationItem key={pageNumber}>
								<PaginationLink
									href="#"
									isActive={pageNumber === page}
									onClick={(event) => {
										event.preventDefault();
										onPageChange(pageNumber);
									}}
								>
									{pageNumber}
								</PaginationLink>
							</PaginationItem>
						))}

						<PaginationItem>
							<PaginationNext
								href="#"
								onClick={(event) => {
									event.preventDefault();
									if (!hasNextPage) return;
									onPageChange(page + 1);
								}}
								aria-disabled={!hasNextPage}
								className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
};
