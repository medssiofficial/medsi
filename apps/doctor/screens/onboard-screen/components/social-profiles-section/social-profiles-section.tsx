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
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useSocialProfilesSection } from "./hook";

export const SocialProfilesSection = (props: { doctor: DoctorMe | null }) => {
	const { doctor } = props;
	const { form, isSaving, handleSave } = useSocialProfilesSection({ doctor });

	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-center justify-between gap-3">
				<div className="flex flex-col gap-0.5">
					<p className="font-heading text-base font-semibold">
						5. Social & Professional Profiles
					</p>
					<p className="text-sm text-muted-foreground">
						Add links that help verify your professional identity.
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
						name="website_url"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Website</FormLabel>
								<FormControl>
									<Input placeholder="https://yourwebsite.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="linkedin_url"
						render={({ field }) => (
							<FormItem>
								<FormLabel>LinkedIn</FormLabel>
								<FormControl>
									<Input placeholder="https://linkedin.com/in/..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="profile_statement"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Professional statement</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Write a short statement about your practice."
										{...field}
									/>
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
