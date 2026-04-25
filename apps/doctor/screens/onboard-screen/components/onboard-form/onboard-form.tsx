"use client";

import { Card } from "@repo/ui/components/ui/card";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { useOnboardForm } from "./hook";
import { UnderReviewBanner } from "../under-review-banner/under-review-banner";
import { ProfileSection } from "../profile-section/profile-section";
import { SpecializationExpertiseSection } from "../specialization-expertise-section/specialization-expertise-section";
import { WorkDetailsSection } from "../work-details-section/work-details-section";
import { CredentialUploadsSection } from "../credential-uploads-section/credential-uploads-section";
import { SocialProfilesSection } from "../social-profiles-section/social-profiles-section";
import { VerificationSection } from "../verification-section/verification-section";

export const OnboardForm = () => {
	const { doctor, isLoading, isUnderReview, canSubmit, completionPercent } =
		useOnboardForm();

	if (isLoading) {
		return (
			<div className="mx-auto w-full max-w-3xl px-4 py-10 flex items-center justify-center">
				<Spinner className="size-6" />
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-3xl px-4 py-10 flex flex-col gap-6">
			<div className="flex flex-col gap-1.5 text-center">
				<p className="font-heading text-2xl font-semibold">
					Complete Your Doctor Profile
				</p>
				<p className="text-sm text-muted-foreground">
					Finish all required sections to submit your profile for verification.
				</p>
			</div>

			{isUnderReview ? <UnderReviewBanner /> : null}

			<Card className="bg-background px-6 py-6 flex flex-col gap-6">
				<ProfileSection doctor={doctor} />
			</Card>

			<Card className="bg-background px-6 py-6 flex flex-col gap-6">
				<SpecializationExpertiseSection doctor={doctor} />
			</Card>

			<Card className="bg-background px-6 py-6 flex flex-col gap-6">
				<WorkDetailsSection doctor={doctor} />
			</Card>

			<Card className="bg-background px-6 py-6 flex flex-col gap-6">
				<CredentialUploadsSection doctor={doctor} />
			</Card>

			<Card className="bg-background px-6 py-6 flex flex-col gap-6">
				<SocialProfilesSection doctor={doctor} />
			</Card>

			<Card className="bg-background px-6 py-6 flex flex-col gap-6">
				<VerificationSection
					doctor={doctor}
					completionPercent={completionPercent}
					canSubmit={canSubmit}
				/>
			</Card>
		</div>
	);
};
