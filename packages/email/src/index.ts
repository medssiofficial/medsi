export { sendEmail } from "./core/send-email";
export type { SendEmailResult } from "./core/send-email";

export {
	sendApplicationSubmittedEmail,
	sendApplicationAcceptedEmail,
	sendApplicationRejectedEmail,
} from "./services/application-emails";

export type { ApplicationSubmittedTemplateProps } from "./templates/application-submitted";
export type { ApplicationAcceptedTemplateProps } from "./templates/application-accepted";
export type { ApplicationRejectedTemplateProps } from "./templates/application-rejected";
