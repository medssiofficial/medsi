"use client";

import type { DoctorMe } from "@/services/api/doctor/get-me";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Separator } from "@repo/ui/components/ui/separator";
import { useSpecializationExpertiseSection } from "./hook";

export const SpecializationExpertiseSection = (props: {
	doctor: DoctorMe | null;
}) => {
	const { doctor } = props;
	const {
		specializations,
		expertises,
		expertiseInput,
		setExpertiseInput,
		addExpertise,
		removeExpertise,
		addSpecializationRow,
		removeSpecializationRow,
		updateSpecializationField,
		handleSaveExpertises,
		handleSaveSpecializations,
		handleUploadSpecializationProof,
		activeSpecializationProofId,
		isSavingExpertises,
		isSavingSpecializations,
		isUploadingSpecializationProof,
	} = useSpecializationExpertiseSection({ doctor });

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-0.5">
				<p className="font-heading text-base font-semibold">
					2. Specialisation & Expertise
				</p>
				<p className="text-sm text-muted-foreground">
					Add your key specialisations and areas of expertise.
				</p>
			</div>

			<Separator />

			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between gap-3">
					<p className="text-sm font-medium">Specialisations</p>
					<div className="flex items-center gap-2">
						<Button type="button" variant="outline" onClick={addSpecializationRow}>
							Add
						</Button>
						<Button
							type="button"
							onClick={handleSaveSpecializations}
							disabled={isSavingSpecializations}
						>
							Save
						</Button>
					</div>
				</div>

				<div className="flex flex-col gap-3">
					{specializations.map((s, idx) => (
						<div
							key={s.id ?? s.client_id}
							className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-start"
						>
							<Input
								placeholder="Specialisation"
								value={s.name}
								onChange={(e) =>
									updateSpecializationField(idx, "name", e.target.value)
								}
							/>
							<div className="flex flex-col gap-2">
								<Input
									id={`specialization-proof-${s.id ?? s.client_id}`}
									type="file"
									accept=".pdf,.jpg,.jpeg,.png,.webp"
									className="hidden"
									onChange={(event) => {
										if (!s.id) return;
										void handleUploadSpecializationProof(
											s.id,
											event.target.files?.[0] ?? null,
										);
										event.target.value = "";
									}}
								/>
								<Button
									type="button"
									variant="outline"
									disabled={
										!s.id ||
										(isUploadingSpecializationProof &&
											activeSpecializationProofId === s.id)
									}
									onClick={() => {
										if (!s.id) return;
										const input = document.getElementById(
											`specialization-proof-${s.id ?? s.client_id}`,
										) as HTMLInputElement | null;
										input?.click();
									}}
								>
									{s.certificate_file_id ? "Replace proof" : "Upload proof"}
								</Button>
								<p className="text-xs text-muted-foreground">
									{s.certificate_file?.filename
										? s.certificate_file.filename
										: s.id
											? "Optional proof"
											: "Save row first to upload"}
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								onClick={() => removeSpecializationRow(idx)}
								disabled={specializations.length === 1}
							>
								Remove
							</Button>
						</div>
					))}
				</div>
				<p className="text-xs text-muted-foreground">
					Specialization proof is optional.
				</p>
			</div>

			<Separator />

			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between gap-3">
					<p className="text-sm font-medium">Expertise</p>
					<Button
						type="button"
						onClick={handleSaveExpertises}
						disabled={isSavingExpertises}
					>
						Save
					</Button>
				</div>

				<div className="flex gap-2">
					<Input
						placeholder="Type expertise and press Enter or comma"
						value={expertiseInput}
						onChange={(e) => setExpertiseInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === ",") {
								e.preventDefault();
								addExpertise();
							}
						}}
					/>
					<Button type="button" variant="outline" onClick={addExpertise}>
						Add
					</Button>
				</div>

				<div className="flex flex-wrap gap-2">
					{expertises.map((e) => (
						<Badge
							key={e}
							variant="secondary"
							className="inline-flex cursor-pointer items-center gap-1"
							onClick={() => removeExpertise(e)}
						>
							{e}
							<span aria-hidden>×</span>
						</Badge>
					))}
				</div>
				<p className="text-xs text-muted-foreground">
					Add at least one expertise to submit your application.
				</p>
			</div>
		</div>
	);
};
