import { EMAIL_ENV } from "@repo/env";
import { sendEmail, type SendEmailResult } from "../core/send-email";
import {
	ApplicationSubmittedTemplate,
	type ApplicationSubmittedTemplateProps,
} from "../templates/application-submitted";
import {
	ApplicationAcceptedTemplate,
	type ApplicationAcceptedTemplateProps,
} from "../templates/application-accepted";
import {
	ApplicationRejectedTemplate,
	type ApplicationRejectedTemplateProps,
} from "../templates/application-rejected";

interface RecipientArgs {
	to: string;
}

const resolveDashboardUrl = (path = "/") => {
	const base = EMAIL_ENV.APP_BASE_URL?.trim();
	if (!base) return undefined;
	return new URL(path, base).toString();
};

export const sendApplicationSubmittedEmail = async (
	args: RecipientArgs & ApplicationSubmittedTemplateProps,
): Promise<SendEmailResult> => {
	return sendEmail({
		to: args.to,
		subject: "Application submitted - Medssi",
		react: ApplicationSubmittedTemplate({ doctorName: args.doctorName }),
	});
};

export const sendApplicationAcceptedEmail = async (
	args: RecipientArgs & Omit<ApplicationAcceptedTemplateProps, "dashboardUrl">,
): Promise<SendEmailResult> => {
	return sendEmail({
		to: args.to,
		subject: "Application approved - Medssi",
		react: ApplicationAcceptedTemplate({
			doctorName: args.doctorName,
			dashboardUrl: resolveDashboardUrl("/"),
		}),
	});
};

export const sendApplicationRejectedEmail = async (
	args: RecipientArgs & ApplicationRejectedTemplateProps,
): Promise<SendEmailResult> => {
	return sendEmail({
		to: args.to,
		subject: "Application update required - Medssi",
		react: ApplicationRejectedTemplate({
			doctorName: args.doctorName,
			reason: args.reason,
		}),
	});
};
