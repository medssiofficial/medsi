"use client";

import type { DoctorMe } from "@/services/api/doctor/get-me";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/ui/select";
import { Separator } from "@repo/ui/components/ui/separator";
import { useProfileSection } from "./hook";

export const ProfileSection = (props: { doctor: DoctorMe | null }) => {
	const { doctor } = props;
	const { form, isSaving, handleSave } = useProfileSection({ doctor });

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-3">
				<div className="flex flex-col gap-0.5">
					<p className="font-heading text-base font-semibold">
						1. Profile Information
					</p>
					<p className="text-sm text-muted-foreground">
						Provide your personal and contact details.
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
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Full name</FormLabel>
								<FormControl>
									<Input placeholder="Full name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="doctor@clinic.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="dob"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Date of birth</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="gender"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Gender</FormLabel>
									<FormControl>
										<Select
											value={field.value}
											onValueChange={(v) => field.onChange(v)}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select gender" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="male">Male</SelectItem>
												<SelectItem value="female">Female</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="mobile_number"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Contact number</FormLabel>
									<FormControl>
										<Input placeholder="Phone number" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="years_of_experience"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Years of experience</FormLabel>
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
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="country"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Country</FormLabel>
									<FormControl>
										<Input placeholder="Country" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="city"
							render={({ field }) => (
								<FormItem>
									<FormLabel>City</FormLabel>
									<FormControl>
										<Input placeholder="City" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="address_line_1"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Address</FormLabel>
								<FormControl>
									<Input placeholder="Address line" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="county"
						render={({ field }) => (
							<FormItem>
								<FormLabel>County</FormLabel>
								<FormControl>
									<Input placeholder="County" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</div>
	);
};
