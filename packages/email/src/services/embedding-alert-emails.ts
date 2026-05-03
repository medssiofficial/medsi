import { EMAIL_ENV } from "@repo/env";
import { sendEmail, type SendEmailResult } from "../core/send-email";
import {
	DoctorEmbeddingFailedTemplate,
	type DoctorEmbeddingFailedTemplateProps,
} from "../templates/doctor-embedding-failed";

const resolveAdminDoctorsUrl = () => {
	const base = EMAIL_ENV.APP_BASE_URL?.trim();
	if (!base) return undefined;
	return new URL("/doctors", base).toString();
};

export interface SendDoctorEmbeddingFailedAlertArgs
	extends Omit<DoctorEmbeddingFailedTemplateProps, "adminDoctorsUrl"> {
	recipients: string[];
}

export const sendDoctorEmbeddingFailedAlert = async (
	args: SendDoctorEmbeddingFailedAlertArgs,
): Promise<SendEmailResult> => {
	const filtered = args.recipients.map((r) => r.trim()).filter(Boolean);
	if (filtered.length === 0) {
		return {
			success: false,
			error: "No admin recipients configured for embedding failure alerts.",
		};
	}

	return sendEmail({
		to: filtered,
		subject: `Medssi: Doctor embedding failed (${args.doctorId})`,
		react: DoctorEmbeddingFailedTemplate({
			doctorId: args.doctorId,
			doctorName: args.doctorName,
			errorMessage: args.errorMessage,
			source: args.source,
			triggerRunId: args.triggerRunId,
			adminDoctorsUrl: resolveAdminDoctorsUrl(),
		}),
	});
};
