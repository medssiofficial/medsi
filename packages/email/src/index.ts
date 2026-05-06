export { sendEmail } from "./core/send-email";
export type { SendEmailResult } from "./core/send-email";

export {
	sendApplicationSubmittedEmail,
	sendApplicationAcceptedEmail,
	sendApplicationRejectedEmail,
} from "./services/application-emails";

export { sendDoctorEmbeddingFailedAlert } from "./services/embedding-alert-emails";
export type { SendDoctorEmbeddingFailedAlertArgs } from "./services/embedding-alert-emails";

export { sendPatientFileProcessingFailedNotice } from "./services/patient-file-emails";
export type { SendPatientFileProcessingFailedNoticeArgs } from "./services/patient-file-emails";
export type { DoctorEmbeddingFailedTemplateProps } from "./templates/doctor-embedding-failed";
export type { PatientFileProcessingFailedTemplateProps } from "./templates/patient-file-processing-failed";

export type { ApplicationSubmittedTemplateProps } from "./templates/application-submitted";
export type { ApplicationAcceptedTemplateProps } from "./templates/application-accepted";
export type { ApplicationRejectedTemplateProps } from "./templates/application-rejected";
