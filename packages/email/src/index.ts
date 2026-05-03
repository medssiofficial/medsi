export { sendEmail } from "./core/send-email";
export type { SendEmailResult } from "./core/send-email";

export {
	sendApplicationSubmittedEmail,
	sendApplicationAcceptedEmail,
	sendApplicationRejectedEmail,
} from "./services/application-emails";

export { sendDoctorEmbeddingFailedAlert } from "./services/embedding-alert-emails";
export type { SendDoctorEmbeddingFailedAlertArgs } from "./services/embedding-alert-emails";
export type { DoctorEmbeddingFailedTemplateProps } from "./templates/doctor-embedding-failed";

export type { ApplicationSubmittedTemplateProps } from "./templates/application-submitted";
export type { ApplicationAcceptedTemplateProps } from "./templates/application-accepted";
export type { ApplicationRejectedTemplateProps } from "./templates/application-rejected";
