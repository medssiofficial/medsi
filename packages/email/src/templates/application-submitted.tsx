import { EmailLayout, EmailText } from "./components/layout";

export interface ApplicationSubmittedTemplateProps {
	doctorName: string;
}

export const ApplicationSubmittedTemplate = (
	props: ApplicationSubmittedTemplateProps,
) => {
	const { doctorName } = props;

	return (
		<EmailLayout
			title="Your application has been submitted"
			previewText="We have received your doctor verification application."
		>
			<EmailText>Hello {doctorName || "Doctor"},</EmailText>
			<EmailText>
				Your doctor verification application has been submitted successfully and is
				now under review.
			</EmailText>
			<EmailText>
				Our team will review your documents and notify you once a decision is made.
			</EmailText>
		</EmailLayout>
	);
};
