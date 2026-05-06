import { EMAIL_ENV } from "@repo/env";
import { sendEmail, type SendEmailResult } from "../core/send-email";
import {
	PatientFileProcessingFailedTemplate,
	type PatientFileProcessingFailedTemplateProps,
} from "../templates/patient-file-processing-failed";

const resolvePatientFilesUrl = () => {
	const base = EMAIL_ENV.APP_BASE_URL?.trim();
	if (!base) return undefined;
	return new URL("/files", base).toString();
};

export interface SendPatientFileProcessingFailedNoticeArgs
	extends Omit<PatientFileProcessingFailedTemplateProps, "filesUrl"> {
	to: string;
}

export const sendPatientFileProcessingFailedNotice = async (
	args: SendPatientFileProcessingFailedNoticeArgs,
): Promise<SendEmailResult> => {
	const email = args.to.trim();
	if (!email) {
		return { success: false, error: "Patient email is missing." };
	}

	return sendEmail({
		to: email,
		subject: `Medssi: File processing failed (${args.filename})`,
		react: PatientFileProcessingFailedTemplate({
			filename: args.filename,
			fileId: args.fileId,
			errorMessage: args.errorMessage,
			source: args.source,
			triggerRunId: args.triggerRunId,
			filesUrl: resolvePatientFilesUrl(),
		}),
	});
};
