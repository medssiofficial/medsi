"use client";

import type { EmbeddingLogItem } from "@/services/api/admin/embedding/get-embedding-logs";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
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
import { useEmbeddingLogsSection } from "./hook";

const formatWhen = (value: string | Date) => {
	const d = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleString();
};

const outcomeBadge = (outcome: string) => {
	if (outcome === "success") {
		return <Badge className="rounded-full">Success</Badge>;
	}
	if (outcome === "failure") {
		return <Badge variant="destructive" className="rounded-full">Failure</Badge>;
	}
	return <Badge variant="secondary" className="rounded-full">{outcome}</Badge>;
};

export const EmbeddingLogsSection = () => {
	const screen = useEmbeddingLogsSection();
	const { items, meta, page, setPage, isLoading, isRefreshing } = screen;

	const from =
		meta.total === 0 ? 0 : (meta.page - 1) * meta.page_size + 1;
	const to = Math.min(meta.total, meta.page * meta.page_size);

	const pageNumbers = Array.from({ length: meta.total_pages }, (_, i) => i + 1);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Doctor embedding activity</CardTitle>
				<CardDescription>
					Audit log of embedding jobs triggered from approvals, manual actions, or
					bulk runs. {isRefreshing && !isLoading ? "Refreshing…" : ""}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="rounded-lg border bg-background">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/60">
								<TableHead>When</TableHead>
								<TableHead>Doctor</TableHead>
								<TableHead>Source</TableHead>
								<TableHead>Outcome</TableHead>
								<TableHead>Model</TableHead>
								<TableHead>Error</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 5 }, (_, index) => (
									<TableRow key={index}>
										{Array.from({ length: 6 }).map((__, i) => (
											<TableCell key={i}>
												<Skeleton className="h-4 w-full max-w-24" />
											</TableCell>
										))}
									</TableRow>
								))
							) : items.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
										No embedding logs yet.
									</TableCell>
								</TableRow>
							) : (
								items.map((row: EmbeddingLogItem) => (
									<TableRow key={row.id}>
										<TableCell className="whitespace-nowrap text-muted-foreground">
											{formatWhen(row.created_at)}
										</TableCell>
										<TableCell className="max-w-40">
											<div className="truncate text-sm font-medium">
												{row.doctor.profile?.name ?? "—"}
											</div>
											<div className="truncate text-xs text-muted-foreground">
												{row.doctor_id}
											</div>
										</TableCell>
										<TableCell className="capitalize">{row.source}</TableCell>
										<TableCell>{outcomeBadge(row.outcome)}</TableCell>
										<TableCell className="max-w-32 truncate text-xs">
											{row.embedding_model ?? "—"}
										</TableCell>
										<TableCell className="max-w-48 truncate text-xs text-destructive">
											{row.error_message ?? "—"}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-3">
					<p className="text-sm text-muted-foreground">
						Showing {from}-{to} of {meta.total} entries
					</p>
					<Pagination className="mx-0 w-auto justify-end">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									href="#"
									onClick={(event) => {
										event.preventDefault();
										if (!meta.has_previous_page) return;
										setPage(page - 1);
									}}
									aria-disabled={!meta.has_previous_page}
									className={
										!meta.has_previous_page ? "pointer-events-none opacity-50" : ""
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
											setPage(pageNumber);
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
										if (!meta.has_next_page) return;
										setPage(page + 1);
									}}
									aria-disabled={!meta.has_next_page}
									className={
										!meta.has_next_page ? "pointer-events-none opacity-50" : ""
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</CardContent>
		</Card>
	);
};
