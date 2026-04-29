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
import type { useProfileScreen } from "../../hook";

export const ProfileForm = (props: {
	screen: ReturnType<typeof useProfileScreen>;
}) => {
	const { screen } = props;
	const isEditable = screen.isEditing;

	if (screen.profileQuery.isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 6 }).map((_, idx) => (
					<Skeleton key={idx} className="h-13 w-full rounded-lg" />
				))}
			</div>
		);
	}

	return (
		<Form {...screen.form}>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					void screen.handleSubmit();
				}}
				className="space-y-4"
			>
				<FormField
					control={screen.form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Full Name</FormLabel>
							<FormControl>
								<Input className="h-13 bg-white" disabled={!isEditable} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={screen.form.control}
					name="age"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Age</FormLabel>
							<FormControl>
								<Input
									type="number"
									className="h-13 bg-white"
									disabled={!isEditable}
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
					control={screen.form.control}
					name="gender"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Gender</FormLabel>
							<Select
								value={field.value}
								onValueChange={field.onChange}
								disabled={!isEditable}
							>
								<FormControl>
									<SelectTrigger className="h-13 bg-white" disabled={!isEditable}>
										<SelectValue />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="male">Male</SelectItem>
									<SelectItem value="female">Female</SelectItem>
									<SelectItem value="other">Other</SelectItem>
								</SelectContent>
							</Select>
						</FormItem>
					)}
				/>

				<FormField
					control={screen.form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									className="h-13 bg-white"
									readOnly
									disabled
									aria-readonly
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={screen.form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Phone</FormLabel>
							<FormControl>
								<Input
									className="h-13 bg-white"
									readOnly
									disabled
									aria-readonly
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={screen.form.control}
					name="country"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Country</FormLabel>
							<FormControl>
								<Input
									className="h-13 bg-white"
									readOnly
									disabled
									aria-readonly
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{isEditable ? (
					<div className="flex items-center gap-3">
						<Button
							type="button"
							variant="outline"
							className="h-13 flex-1 text-base"
							onClick={screen.handleCancelEdit}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="h-13 flex-1 text-base"
							disabled={screen.isSaving}
						>
							{screen.isSaving ? <Spinner className="size-4" /> : "Save Changes"}
						</Button>
					</div>
				) : null}
			</form>
		</Form>
	);
};
