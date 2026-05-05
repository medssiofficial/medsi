"use client";

import type { MedicalCaseListItem } from "@/services/api/admin/medical-cases/get-medical-cases";
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
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMedicalCasesTable } from "./hook";

interface MedicalCasesTableProps {
	items: MedicalCaseListItem[];
	isLoading: boolean;
	isRefreshing: boolean;
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onPageChange: (page: number) => void;
}

const TABLE_HEADERS = [
	"Case ID",
	"Patient",
	"Email",
	"Stage",
	"Status",
	"Files",
	"Messages",
	"Created",
	"Actions",
];

export const MedicalCasesTable = (props: MedicalCasesTableProps) => {
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
	} = props;

	const router = useRouter();
	const {
		pageNumbers,
		formatDate,
		truncateId,
		getStageBadgeClasses,
		getStatusBadgeClasses,
		formatStageLabel,
		formatStatusLabel,
	} = useMedicalCasesTable({
		currentPage: page,
		totalPages,
	});

	const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(total, page * pageSize);

	const handleRowClick = (caseId: string) => {
		router.push(`/medical-cases/${caseId}`);
	};

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
						Array.from({ length: 8 }, (_, rowIndex) => (
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
						items.map((medicalCase) => (
							<TableRow
								key={medicalCase.id}
								className="cursor-pointer hover:bg-muted/40"
								onClick={() => handleRowClick(medicalCase.id)}
							>
								<TableCell className="max-w-[100px] truncate font-mono text-xs">
									{truncateId(medicalCase.id)}
								</TableCell>
								<TableCell className="max-w-[160px] truncate font-medium">
									{medicalCase.user?.profile?.name ?? "—"}
								</TableCell>
								<TableCell className="max-w-[180px] truncate text-muted-foreground">
									{medicalCase.user?.profile?.email ?? "—"}
								</TableCell>
								<TableCell>
									<Badge
										variant="secondary"
										className={`rounded-full font-medium ${getStageBadgeClasses(medicalCase.case_stage)}`}
									>
										{formatStageLabel(medicalCase.case_stage)}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge
										variant="secondary"
										className={`rounded-full font-medium ${getStatusBadgeClasses(medicalCase.conversation_status)}`}
									>
										{formatStatusLabel(medicalCase.conversation_status)}
									</Badge>
								</TableCell>
								<TableCell className="tabular-nums">
									{medicalCase._count.files}
								</TableCell>
								<TableCell className="tabular-nums">
									{medicalCase._count.chat_messages}
								</TableCell>
								<TableCell className="text-muted-foreground">
									{formatDate(medicalCase.created_at)}
								</TableCell>
								<TableCell>
									<Button
										variant="ghost"
										size="icon"
										className="size-8"
										onClick={(e) => {
											e.stopPropagation();
											handleRowClick(medicalCase.id);
										}}
									>
										<Eye className="size-4" />
									</Button>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			<div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
				<p className="text-sm text-muted-foreground">
					Showing {from}-{to} of {total} cases
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
