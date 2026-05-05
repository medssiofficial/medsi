import { EmailLayout, EmailText } from "./components/layout";

export interface PatientFileProcessingFailedTemplateProps {
	filename: string;
	fileId: string;
	errorMessage: string;
	source: string;
	triggerRunId?: string;
	filesUrl?: string;
}

export const PatientFileProcessingFailedTemplate = (
	props: PatientFileProcessingFailedTemplateProps,
) => {
	const { filename, fileId, errorMessage, source, triggerRunId, filesUrl } = props;

	return (
		<EmailLayout
			title="File processing failed"
			previewText={`We could not finish processing ${filename}.`}
			cta={
				filesUrl
					? {
							label: "Open Files",
							href: filesUrl,
						}
					: undefined
			}
		>
			<EmailText>
				Your medical file could not be processed automatically. You can try again from the
				Files section in your account.
			</EmailText>
			<EmailText>
				<strong>File:</strong> {filename}
				<br />
				<strong>File ID:</strong> {fileId}
				<br />
				<strong>Source:</strong> {source}
				<br />
				{triggerRunId ? (
					<>
						<strong>Reference:</strong> {triggerRunId}
						<br />
					</>
				) : null}
			</EmailText>
			<EmailText>
				<strong>Details</strong>
				<br />
				{errorMessage}
			</EmailText>
		</EmailLayout>
	);
};
