import { EmailLayout, EmailText } from "./components/layout";

export interface DoctorEmbeddingFailedTemplateProps {
	doctorId: string;
	doctorName?: string;
	errorMessage: string;
	source: string;
	triggerRunId?: string;
	adminDoctorsUrl?: string;
}

export const DoctorEmbeddingFailedTemplate = (
	props: DoctorEmbeddingFailedTemplateProps,
) => {
	const {
		doctorId,
		doctorName,
		errorMessage,
		source,
		triggerRunId,
		adminDoctorsUrl,
	} = props;

	return (
		<EmailLayout
			title="Doctor embedding failed"
			previewText={`Embedding job failed for doctor ${doctorId}.`}
			cta={
				adminDoctorsUrl
					? {
							label: "Open Doctors",
							href: adminDoctorsUrl,
						}
					: undefined
			}
		>
			<EmailText>A doctor profile embedding job failed and needs attention.</EmailText>
			<EmailText>
				<strong>Doctor ID:</strong> {doctorId}
				<br />
				{doctorName ? (
					<>
						<strong>Name:</strong> {doctorName}
						<br />
					</>
				) : null}
				<strong>Source:</strong> {source}
				<br />
				{triggerRunId ? (
					<>
						<strong>Trigger run:</strong> {triggerRunId}
						<br />
					</>
				) : null}
			</EmailText>
			<EmailText>
				<strong>Error</strong>
				<br />
				{errorMessage}
			</EmailText>
		</EmailLayout>
	);
};
