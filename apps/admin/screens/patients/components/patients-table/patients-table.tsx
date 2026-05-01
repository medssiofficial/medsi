"use client";

import type { PatientListItem } from "@/services/api/admin/patients/get-patients";
import { Badge } from "@repo/ui/components/ui/badge";
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
import { PatientsRowActions } from "../patients-row-actions";
import { usePatientsTable } from "./hook";

interface PatientsTableProps {
	items: PatientListItem[];
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
	"Patient",
	"Email",
	"Account status",
	"Join date",
	"Cases",
	"Actions",
];

export const PatientsTable = (props: PatientsTableProps) => {
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

	const { pageNumbers, formatDate } = usePatientsTable({
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
								{Array.from({ length: TABLE_HEADERS.length }).map((_, colIndex) => (
									<TableCell key={colIndex}>
										<Skeleton className="h-4 w-full max-w-28" />
									</TableCell>
								))}
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
						items.map((patient) => (
							<TableRow key={patient.profile_id}>
								<TableCell className="max-w-[200px] truncate font-medium">
									{patient.name}
								</TableCell>
								<TableCell className="max-w-[200px] truncate text-muted-foreground">
									{patient.email}
								</TableCell>
								<TableCell>
									<Badge
										variant="secondary"
										className="rounded-full bg-emerald-100 font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
									>
										Active
									</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{formatDate(patient.join_date)}
								</TableCell>
								<TableCell className="tabular-nums">{patient.cases_count}</TableCell>
								<TableCell className="text-right">
									<PatientsRowActions patientName={patient.name} />
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			<div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
				<p className="text-sm text-muted-foreground">
					Showing {from}-{to} of {total} patients
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
