"use client";

import type { DoctorDetail } from "@/services/api/admin/doctors/get-doctor-detail";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card } from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { FileText } from "lucide-react";
import { useDoctorDetail } from "./hook";

interface DoctorDetailProps {
	doctor: DoctorDetail | null;
	isLoading: boolean;
}

export const DoctorDetailCard = (props: DoctorDetailProps) => {
	const { doctor, isLoading } = props;
	const { leftFields, rightFields, docs } = useDoctorDetail({ doctor });

	if (!doctor && !isLoading) return null;

	return (
		<Card className="p-6">
			{isLoading ? (
				<div className="space-y-4">
					<Skeleton className="h-8 w-1/3" />
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			) : (
				<div className="space-y-5">
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="font-heading text-xl font-semibold">
								{doctor?.profile?.name ?? "Doctor"}
							</p>
							<p className="text-sm text-muted-foreground">
								{doctor?.profile?.email ?? "-"}
							</p>
						</div>
						<Badge variant={doctor?.verified ? "default" : "secondary"}>
							{doctor?.verified ? "Verified" : "Unverified"}
						</Badge>
					</div>

					<Separator />

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-2">
							{leftFields.map((field) => (
								<div key={field.label} className="flex items-center justify-between gap-3">
									<span className="text-sm text-muted-foreground">{field.label}</span>
									<span className="text-sm text-foreground">{field.value}</span>
								</div>
							))}
						</div>
						<div className="space-y-2">
							{rightFields.map((field) => (
								<div key={field.label} className="flex items-center justify-between gap-3">
									<span className="text-sm text-muted-foreground">{field.label}</span>
									<span className="text-sm text-foreground">{field.value}</span>
								</div>
							))}
						</div>
					</div>

					<Separator />

					<div className="space-y-2">
						<p className="font-heading text-base font-semibold">Verification Documents</p>
						{docs.length === 0 ? (
							<p className="text-sm text-muted-foreground">No documents uploaded.</p>
						) : (
							<div className="grid gap-2 md:grid-cols-2">
								{docs.map((doc) => (
									<div
										key={`${doc.label}-${doc.value}`}
										className="flex items-center gap-2 rounded-md bg-muted px-3 py-2"
									>
										<FileText className="size-4 text-muted-foreground" />
										<div className="min-w-0">
											<p className="text-sm text-foreground">{doc.label}</p>
											<p className="truncate text-xs text-muted-foreground">{doc.value}</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</Card>
	);
};
