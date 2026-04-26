import { EMAIL_ENV } from "@repo/env";
import type { ReactNode } from "react";
import { getResendClient } from "../client/resend-client";

interface SendEmailArgs {
	to: string | string[];
	subject: string;
	react: ReactNode;
	from?: string;
	replyTo?: string;
}

export type SendEmailResult =
	| { success: true; id: string | null }
	| { success: false; error: string };

export const sendEmail = async (args: SendEmailArgs): Promise<SendEmailResult> => {
	const resend = getResendClient();
	if (!resend) {
		return {
			success: false,
			error: "Resend is not configured. Missing RESEND_API_KEY.",
		};
	}

	const from = args.from?.trim() || EMAIL_ENV.EMAIL_FROM?.trim();
	if (!from) {
		return {
			success: false,
			error: "Sender is not configured. Missing EMAIL_FROM.",
		};
	}

	try {
		const response = await resend.emails.send({
			from,
			to: args.to,
			subject: args.subject,
			react: args.react,
			replyTo: args.replyTo?.trim() || EMAIL_ENV.EMAIL_REPLY_TO?.trim(),
		});

		if (response.error) {
			return {
				success: false,
				error: response.error.message,
			};
		}

		return {
			success: true,
			id: response.data?.id ?? null,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to send email.",
		};
	}
};
