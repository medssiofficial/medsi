import { EmailLayout, EmailText } from "./components/layout";

export interface ApplicationAcceptedTemplateProps {
	doctorName: string;
	dashboardUrl?: string;
}

export const ApplicationAcceptedTemplate = (
	props: ApplicationAcceptedTemplateProps,
) => {
	const { doctorName, dashboardUrl } = props;

	return (
		<EmailLayout
			title="Your application has been accepted"
			previewText="Your doctor account is now verified."
			cta={
				dashboardUrl
					? {
							label: "Go to Dashboard",
							href: dashboardUrl,
						}
					: undefined
			}
		>
			<EmailText>Hello {doctorName || "Doctor"},</EmailText>
			<EmailText>
				Great news! Your verification application has been approved, and your
				account is now verified.
			</EmailText>
			<EmailText>
				You can now sign in and access the full doctor dashboard experience.
			</EmailText>
		</EmailLayout>
	);
};
