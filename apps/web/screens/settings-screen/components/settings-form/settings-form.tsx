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
import { Switch } from "@repo/ui/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/ui/select";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { Spinner } from "@repo/ui/components/ui/spinner";
import type { useSettingsScreen } from "../../hook";

export const SettingsForm = (props: {
	screen: ReturnType<typeof useSettingsScreen>;
}) => {
	const { screen } = props;

	if (screen.settingsQuery.isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 4 }).map((_, idx) => (
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
				className="space-y-6"
			>
				<FormField
					control={screen.form.control}
					name="notifications_enabled"
					render={({ field }) => (
						<FormItem className="rounded-2xl border border-border-subtle bg-white p-4">
							<div className="flex items-center justify-between gap-4">
								<div>
									<FormLabel className="text-sm font-semibold text-font-primary">
										Notifications
									</FormLabel>
									<p className="mt-1 text-xs text-font-tertiary">
										Receive updates and reminders.
									</p>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={screen.form.control}
					name="language"
					render={({ field }) => (
						<FormItem className="space-y-2">
							<FormLabel className="text-sm font-semibold text-font-primary">
								Language
							</FormLabel>
							<Select value={field.value} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger className="h-12 w-fit min-w-[160px] rounded-2xl border-border-subtle bg-white px-4 text-left">
										<SelectValue />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="English">English</SelectItem>
									<SelectItem value="Spanish">Spanish</SelectItem>
									<SelectItem value="French">French</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={screen.form.control}
					name="data_sharing"
					render={({ field }) => (
						<FormItem className="space-y-2">
							<FormLabel className="text-sm font-semibold text-font-primary">
								Data Sharing
							</FormLabel>
							<Select value={field.value} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger className="h-12 w-fit min-w-[160px] rounded-2xl border-border-subtle bg-white px-4 text-left">
										<SelectValue />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="limited">Limited</SelectItem>
									<SelectItem value="full">Full</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					className="h-12 w-full rounded-xl text-base"
					disabled={screen.isSaving}
				>
					{screen.isSaving ? <Spinner className="size-4" /> : "Save Settings"}
				</Button>
			</form>
		</Form>
	);
};
