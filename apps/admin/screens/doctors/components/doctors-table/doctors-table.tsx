"use client";

import type { DoctorListItem } from "@/services/api/admin/doctors/get-doctors";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	Empty,
	EmptyDescription,
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
import { useDoctorsTable } from "./hook";

interface DoctorsTableProps {
	items: DoctorListItem[];
	isLoading: boolean;
	isRefreshing: boolean;
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	onPageChange: (page: number) => void;
	onViewDoctor: (doctorId: string) => void;
}

const TABLE_HEADERS = [
	"Name",
	"Medssi ID",
	"Specialization",
	"Location",
	"Yrs",
	"Work Setup",
	"Verification",
	"Date",
	"Action",
];

export const DoctorsTable = (props: DoctorsTableProps) => {
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
		onViewDoctor,
	} = props;

	const { pageNumbers, formatDate, toWorkSetup } = useDoctorsTable({
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
						Array.from({ length: 6 }, (_, index) => (
							<TableRow key={index}>
								{Array.from({ length: TABLE_HEADERS.length }).map((_, i) => (
									<TableCell key={i}>
										<Skeleton className="h-4 w-full max-w-24" />
									</TableCell>
								))}
							</TableRow>
						))
					) : items.length === 0 ? (
						<TableRow>
							<TableCell colSpan={TABLE_HEADERS.length} className="p-0">
								<Empty className="rounded-none border-0 py-14">
									<EmptyHeader>
										<EmptyTitle>No doctors found</EmptyTitle>
										<EmptyDescription>
											No doctors match the current search criteria.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							</TableCell>
						</TableRow>
					) : (
						items.map((doctor) => (
							<TableRow key={doctor.id}>
								<TableCell className="max-w-36 truncate font-medium">
									{doctor.profile?.name ?? "-"}
								</TableCell>
								<TableCell>{`MED-${doctor.id.slice(-4).toUpperCase()}`}</TableCell>
								<TableCell className="max-w-32 truncate">
									{doctor.specializations[0]?.name ?? "-"}
								</TableCell>
								<TableCell className="max-w-24 truncate">
									{doctor.profile?.city || doctor.profile?.country || "-"}
								</TableCell>
								<TableCell>{doctor.profile?.years_in_practice ?? "-"}</TableCell>
								<TableCell>{toWorkSetup(doctor.profile?.type_of_doctor)}</TableCell>
								<TableCell>
									<Badge
										variant={doctor.verified ? "default" : "secondary"}
										className="rounded-full"
									>
										{doctor.verified ? "Verified" : "Unverified"}
									</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{formatDate(doctor.created_at)}
								</TableCell>
								<TableCell>
									<Button
										size="sm"
										variant="ghost"
										type="button"
										onClick={() => onViewDoctor(doctor.id)}
									>
										View
									</Button>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			<div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
				<p className="text-sm text-muted-foreground">
					Showing {from}-{to} of {total} doctors
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
								className={!hasPreviousPage ? "pointer-events-none opacity-50" : ""}
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
