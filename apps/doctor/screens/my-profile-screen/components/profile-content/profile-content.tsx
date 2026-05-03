"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import type { useMyProfileScreen } from "../../hook";
import { useProfileContent } from "./hook";

type ProfileView = ReturnType<typeof useMyProfileScreen>["profileView"];

const InfoField = (props: { label: string; value: string }) => {
	return (
		<div className="space-y-1 rounded-lg border border-border bg-muted/60 px-3 py-2.5">
			<p className="text-xs font-medium text-font-tertiary">{props.label}</p>
			<p className="text-sm font-medium text-font-primary">{props.value}</p>
		</div>
	);
};

export const ProfileContent = (props: { profileView: ProfileView }) => {
	const { profileView } = props;
	const content = useProfileContent(profileView);

	return (
		<div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
			<Card className="h-fit gap-4 self-start border border-border-subtle py-5">
				<CardContent className="flex flex-col items-center gap-3">
					<Avatar className="size-24 border border-primary/20 bg-primary/10">
						<AvatarImage src={profileView.avatarUrl ?? undefined} />
						<AvatarFallback className="text-xl font-bold text-primary">
							{profileView.initials}
						</AvatarFallback>
					</Avatar>
					<div className="text-center">
						<p className="text-xl font-bold text-font-primary">{profileView.fullName}</p>
						<p className="text-sm text-font-secondary">{profileView.specialty}</p>
					</div>
					<Badge className={content.statusTone}>{content.statusLabel}</Badge>
					<p className="text-xs text-font-tertiary">License: {profileView.license}</p>
				</CardContent>
			</Card>

			<Card className="h-fit gap-4 self-start border border-border-subtle py-5">
				<CardHeader className="pb-0">
					<CardTitle className="text-lg font-semibold text-font-primary">
						Professional Details
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						<InfoField label="Full Name" value={profileView.fullName} />
						<InfoField label="Specialty" value={profileView.specialty} />
						<InfoField label="Hospital" value={profileView.currentInstitution} />
						<InfoField label="Experience" value={profileView.experienceYears} />
					</div>

					<div className="rounded-lg border border-border bg-muted/60 p-3">
						<p className="mb-1 text-xs font-medium text-font-tertiary">Short Bio</p>
						<p className="text-sm leading-relaxed text-font-secondary">
							{profileView.bio}
						</p>
					</div>

					<Accordion type="multiple">
						<AccordionItem value="basic">
							<AccordionTrigger className="py-3 text-sm font-semibold text-font-primary hover:no-underline">
								Basic Details
							</AccordionTrigger>
							<AccordionContent className="space-y-2">
								<InfoField label="Email" value={profileView.email} />
								<InfoField label="Phone" value={profileView.phone} />
								<InfoField label="Age" value={profileView.age} />
								<InfoField label="Gender" value={profileView.gender} />
								<InfoField label="Country" value={profileView.country} />
								<InfoField label="City" value={profileView.city} />
								<InfoField
									label="Address"
									value={profileView.address || "No address provided"}
								/>
							</AccordionContent>
						</AccordionItem>

						<AccordionItem value="expertise">
							<AccordionTrigger className="py-3 text-sm font-semibold text-font-primary hover:no-underline">
								Specializations & Expertise
							</AccordionTrigger>
							<AccordionContent className="space-y-3">
								<div>
									<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-font-tertiary">
										Specializations
									</p>
									<div className="flex flex-wrap gap-2">
										{profileView.specializations.length > 0 ? (
											profileView.specializations.map((item) => (
												<Badge key={item.id} variant="outline">
													{item.name}
												</Badge>
											))
										) : (
											<p className="text-sm text-font-secondary">
												No specializations added.
											</p>
										)}
									</div>
								</div>
								<div>
									<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-font-tertiary">
										Expertise
									</p>
									<div className="flex flex-wrap gap-2">
										{profileView.expertises.length > 0 ? (
											profileView.expertises.map((item) => (
												<Badge key={item.id} variant="outline">
													{item.expertise}
												</Badge>
											))
										) : (
											<p className="text-sm text-font-secondary">
												No expertise added.
											</p>
										)}
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</CardContent>
			</Card>

			<Card className="h-fit gap-3 self-start border border-border-subtle py-5">
				<CardHeader className="pb-0">
					<CardTitle className="text-lg font-semibold text-font-primary">
						Practice Snapshot
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<InfoField label="Years in Practice" value={profileView.yearsInPractice} />
					<InfoField
						label="Total Work Entries"
						value={`${profileView.experiences.length}`}
					/>
					<InfoField
						label="Verification"
						value={profileView.isVerified ? "Verified Doctor" : "Pending Verification"}
					/>
				</CardContent>
			</Card>
		</div>
	);
};
