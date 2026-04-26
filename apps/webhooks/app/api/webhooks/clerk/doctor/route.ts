import { SERVER_ENV } from "@/config/server-env";
import { UserDeletedJSON } from "@clerk/backend";
import { UserJSON } from "@clerk/nextjs/types";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { deleteDoctor, upsertDoctor } from "@repo/database/actions/doctor";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

const WebhookEventHandlers = {
	"user.created": async (data: UserJSON) => {
		await upsertDoctor({
			clerk_id: data.id,
		});
	},
	"user.updated": async (data: UserJSON) => {
		await upsertDoctor({
			clerk_id: data.id,
		});
	},
	"user.deleted": async (data: UserDeletedJSON) => {
		if (!data.id) return;

		await deleteDoctor({
			clerk_id: data.id,
		});
	},
};

export const POST = createApi({
	execute: async ({ req }) => {
		const { type, data } = await verifyWebhook(req, {
			signingSecret: SERVER_ENV.DOCTOR_CLERK_SIGNING_SECRET,
		});

		if (type === "user.created" || type === "user.updated") {
			await WebhookEventHandlers[type](data as unknown as UserJSON);
			console.log("User created or updated");
		} else if (type === "user.deleted") {
			await WebhookEventHandlers[type](data);
			console.log("User deleted");
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
		});
	},
});
