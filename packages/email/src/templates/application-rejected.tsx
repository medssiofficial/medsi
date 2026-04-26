import { EmailLayout, EmailText } from "./components/layout";

export interface ApplicationRejectedTemplateProps {
	doctorName: string;
	reason: string;
}

export const ApplicationRejectedTemplate = (
	props: ApplicationRejectedTemplateProps,
) => {
	const { doctorName, reason } = props;

	return (
		<EmailLayout
			title="Your application needs updates"
			previewText="Your verification application was not approved."
		>
			<EmailText>Hello {doctorName || "Doctor"},</EmailText>
			<EmailText>
				We reviewed your verification application and currently cannot approve it.
			</EmailText>
			<EmailText>
				Reason: <strong>{reason}</strong>
			</EmailText>
			<EmailText>
				Please update your profile and documents, then submit your application
				again.
			</EmailText>
		</EmailLayout>
	);
};
