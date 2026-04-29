"use client";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/ui/select";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { ArrowRightIcon } from "lucide-react";
import { useOnboardForm } from "./hook";

export const OnboardForm = () => {
	const { form, isLoadingPatient, isSaving, handleSubmit } = useOnboardForm();

	if (isLoadingPatient) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-13 w-full rounded-lg" />
				<Skeleton className="h-13 w-full rounded-lg" />
				<Skeleton className="h-13 w-full rounded-lg" />
				<Skeleton className="h-13 w-full rounded-lg" />
				<Skeleton className="h-13 w-full rounded-lg" />
				<Skeleton className="h-13 w-full rounded-lg" />
				<Skeleton className="h-13 w-full rounded-lg" />
			</div>
		);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					void handleSubmit();
				}}
				className="space-y-4"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Full Name</FormLabel>
							<FormControl>
								<Input className="h-13 bg-white" placeholder="Enter full name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="age"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Age</FormLabel>
							<FormControl>
								<Input
									type="number"
									className="h-13 bg-white"
									placeholder="Enter age"
									value={field.value || ""}
									onChange={(event) =>
										field.onChange(event.target.valueAsNumber || 0)
									}
								/>
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
							<Select value={field.value} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger className="h-13 w-full bg-white">
										<SelectValue placeholder="Select gender" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="male">Male</SelectItem>
									<SelectItem value="female">Female</SelectItem>
									<SelectItem value="other">Other</SelectItem>
								</SelectContent>
							</Select>
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
								<Input className="h-13 bg-white" type="email" placeholder="you@example.com" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Phone</FormLabel>
							<FormControl>
								<Input className="h-13 bg-white" placeholder="+1 123456789" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="country"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Country</FormLabel>
							<FormControl>
								<Input className="h-13 bg-white" placeholder="Country" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="mt-4 h-13 w-full rounded-lg text-base" disabled={isSaving}>
					{isSaving ? (
						<Spinner className="size-4" />
					) : (
						<>
							Save & Continue
							<ArrowRightIcon className="size-4" />
						</>
					)}
				</Button>
			</form>
		</Form>
	);
};
