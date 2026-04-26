"use client";

import type { DoctorMe } from "@/services/api/doctor/get-me";
import { Button } from "@repo/ui/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Separator } from "@repo/ui/components/ui/separator";
import { useWorkDetailsSection } from "./hook";

export const WorkDetailsSection = (props: { doctor: DoctorMe | null }) => {
	const { doctor } = props;
	const {
		form,
		isSaving,
		handleSave,
		handleUploadExperienceProof,
		isUploadingExperienceProof,
		experienceProofFileName,
	} = useWorkDetailsSection({ doctor });

	const practiceTypes: Array<{
		value: "telehealth" | "hospital" | "private" | "hybrid";
		label: string;
	}> = [
		{ value: "telehealth", label: "Telehealth" },
		{ value: "hospital", label: "Hospital" },
		{ value: "private", label: "Private" },
		{ value: "hybrid", label: "Hybrid" },
	];

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-3">
				<div className="flex flex-col gap-0.5">
					<p className="font-heading text-base font-semibold">3. Work Details</p>
					<p className="text-sm text-muted-foreground">
						Add your practice information.
					</p>
				</div>
				<Button type="button" onClick={handleSave} disabled={isSaving}>
					Save
				</Button>
			</div>

			<Separator />

			<Form {...form}>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSave();
					}}
					className="flex flex-col gap-4"
				>
					<FormField
						control={form.control}
						name="medical_registration_number"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Medical Registration Number</FormLabel>
								<FormControl>
									<Input placeholder="Medical registration number" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="current_institution"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Current hospital/clinic</FormLabel>
								<FormControl>
									<Input placeholder="Current hospital or clinic name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="years_in_practice"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Years of clinical practice</FormLabel>
								<FormControl>
									<Input
										type="number"
										min={0}
										value={field.value}
										onChange={(e) =>
											field.onChange(
												e.target.value === "" ? 0 : Number(e.target.value),
											)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="type_of_doctor"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Practice type</FormLabel>
								<FormControl>
									<div className="flex flex-wrap gap-2">
										{practiceTypes.map((t) => {
											const isSelected = field.value === t.value;
											return (
												<Button
													key={t.value}
													type="button"
													variant={isSelected ? "default" : "outline"}
													onClick={() => field.onChange(t.value)}
												>
													{t.label}
												</Button>
											);
										})}
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex flex-col gap-2">
						<p className="text-sm font-medium">Experience proof (optional)</p>
						<Input
							id="experience-proof-upload"
							type="file"
							accept=".pdf,.jpg,.jpeg,.png,.webp"
							className="hidden"
							onChange={(event) => {
								void handleUploadExperienceProof(
									event.target.files?.[0] ?? null,
								);
								event.target.value = "";
							}}
						/>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									const input = document.getElementById(
										"experience-proof-upload",
									) as HTMLInputElement | null;
									input?.click();
								}}
								disabled={isUploadingExperienceProof}
							>
								{experienceProofFileName ? "Replace proof" : "Upload proof"}
							</Button>
							<p className="text-xs text-muted-foreground">
								{experienceProofFileName ?? "No file uploaded"}
							</p>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
};
