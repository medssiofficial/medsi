"use client";

import type { DoctorMe } from "@/services/api/doctor/get-me";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Progress } from "@repo/ui/components/ui/progress";
import { Separator } from "@repo/ui/components/ui/separator";
import { useCredentialUploadsSection } from "./hook";

export const CredentialUploadsSection = (props: { doctor: DoctorMe | null }) => {
	const { doctor } = props;
	const { items, handleUploadProof, activeProofType, isUploading } =
		useCredentialUploadsSection({ doctor });

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-0.5">
				<p className="font-heading text-base font-semibold">
					4. Credential Uploads
				</p>
				<p className="text-sm text-muted-foreground">
					Add certificate keys/links for required documents.
				</p>
			</div>

			<Separator />

			<div className="flex flex-col gap-4">
				{items.map((item) => (
					<div key={item.label} className="flex flex-col gap-2">
						<div className="flex items-center justify-between gap-2">
							<p className="text-sm font-medium">{item.label}</p>
							<p className="text-xs text-muted-foreground">
								{item.file_name ?? item.status}
							</p>
						</div>
						<Progress value={item.progress} />
						<div className="flex items-center justify-end">
							<Input
								id={`proof-${item.proof_type}`}
								type="file"
								accept=".pdf,.jpg,.jpeg,.png,.webp"
								className="hidden"
								onChange={(event) => {
									void handleUploadProof(
										item.proof_type,
										event.target.files?.[0] ?? null,
									);
									event.target.value = "";
								}}
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={isUploading && activeProofType === item.proof_type}
								onClick={() => {
									const input = document.getElementById(
										`proof-${item.proof_type}`,
									) as HTMLInputElement | null;
									input?.click();
								}}
							>
								{item.progress === 100 ? "Replace file" : "Upload file"}
							</Button>
						</div>
					</div>
				))}

				<p className="text-xs text-muted-foreground">
					Accepted formats: PDF, JPG, JPEG, PNG, WEBP (max 10 MB each).
				</p>
			</div>
		</div>
	);
};
