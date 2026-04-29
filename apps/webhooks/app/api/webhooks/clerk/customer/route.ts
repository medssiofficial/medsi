import { SERVER_ENV } from "@/config/server-env";
import { UserDeletedJSON } from "@clerk/backend";
import { UserJSON } from "@clerk/nextjs/types";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import {
	deletePatient,
	syncPatientProfileByClerkId,
	upsertPatient,
} from "@repo/database/actions/patient";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

const getPrimaryEmail = (data: UserJSON) => {
	const primaryEmailId = data.primary_email_address_id;
	if (!primaryEmailId) return null;

	return (
		data.email_addresses.find((email) => email.id === primaryEmailId)
			?.email_address ?? null
	);
};

const getPrimaryPhone = (data: UserJSON) => {
	const primaryPhoneId = data.primary_phone_number_id;
	if (!primaryPhoneId) return null;

	return (
		data.phone_numbers.find((phone) => phone.id === primaryPhoneId)
			?.phone_number ?? null
	);
};

const getName = (data: UserJSON) => {
	const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");
	return fullName.trim() || null;
};

const WebhookEventHandlers = {
	"user.created": async (data: UserJSON) => {
		await upsertPatient({
			clerk_id: data.id,
		});
		await syncPatientProfileByClerkId({
			clerk_id: data.id,
			name: getName(data),
			email: getPrimaryEmail(data),
			phone: getPrimaryPhone(data),
			image_url: data.image_url,
		});
	},
	"user.updated": async (data: UserJSON) => {
		await upsertPatient({
			clerk_id: data.id,
		});
		await syncPatientProfileByClerkId({
			clerk_id: data.id,
			name: getName(data),
			email: getPrimaryEmail(data),
			phone: getPrimaryPhone(data),
			image_url: data.image_url,
		});
	},
	"user.deleted": async (data: UserDeletedJSON) => {
		if (!data.id) return;

		await deletePatient({
			clerk_id: data.id,
		});
	},
};

export const POST = createApi({
	execute: async ({ req }) => {
		const signingSecret = SERVER_ENV.CUSTOMER_CLERK_SIGNING_SECRET;

		if (!signingSecret) {
			throw new ApiError(
				"CUSTOMER_CLERK_SIGNING_SECRET is not configured.",
				500,
			);
		}

		const { type, data } = await verifyWebhook(req, {
			signingSecret,
		});

		if (type === "user.created" || type === "user.updated") {
			await WebhookEventHandlers[type](data as unknown as UserJSON);
			console.log("Customer created or updated");
		} else if (type === "user.deleted") {
			await WebhookEventHandlers[type](data);
			console.log("Customer deleted");
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
		});
	},
});
