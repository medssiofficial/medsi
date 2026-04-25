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
		isSavingExpertises,
		isSavingSpecializations,
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
							key={`${idx}-${s.name}`}
							className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-start"
						>
							<Input
								placeholder="Specialisation"
								value={s.name}
								onChange={(e) =>
									updateSpecializationField(idx, "name", e.target.value)
								}
							/>
							<Input
								placeholder="Certificate link / key"
								value={s.certificate_file_key ?? ""}
								onChange={(e) =>
									updateSpecializationField(
										idx,
										"certificate_file_key",
										e.target.value,
									)
								}
							/>
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
						placeholder="Add an expertise"
						value={expertiseInput}
						onChange={(e) => setExpertiseInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
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
						<button
							type="button"
							key={e}
							onClick={() => removeExpertise(e)}
							className="text-left"
						>
							<Badge variant="secondary">{e}</Badge>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};
