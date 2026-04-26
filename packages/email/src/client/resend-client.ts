import { EMAIL_ENV } from "@repo/env";
import { Resend } from "resend";

let resendClient: Resend | null = null;

export const getResendClient = () => {
	const apiKey = EMAIL_ENV.RESEND_API_KEY?.trim();

	if (!apiKey) {
		return null;
	}

	if (!resendClient) {
		resendClient = new Resend(apiKey);
	}

	return resendClient;
};
