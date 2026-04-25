"use client";

import type { DoctorMe } from "@/services/api/doctor/get-me";
import { Progress } from "@repo/ui/components/ui/progress";
import { Separator } from "@repo/ui/components/ui/separator";
import { useCredentialUploadsSection } from "./hook";

export const CredentialUploadsSection = (props: { doctor: DoctorMe | null }) => {
	const { doctor } = props;
	const { items } = useCredentialUploadsSection({ doctor });

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
							<p className="text-xs text-muted-foreground">{item.status}</p>
						</div>
						<Progress value={item.progress} />
					</div>
				))}

				<p className="text-xs text-muted-foreground">
					Use the “Certificate link / key” field in the Specialisations section
					to update these statuses.
				</p>
			</div>
		</div>
	);
};
