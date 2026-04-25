import { SERVER_ENV } from "@/config/server-env";
import { UserDeletedJSON } from "@clerk/backend";
import { UserJSON } from "@clerk/nextjs/types";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { deleteAdmin, upsertAdmin } from "@repo/database/actions/admin";
import { ApiError } from "@repo/types/error";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";

const WebhookEventHandlers = {
	"user.created": async (data: UserJSON) => {
		await upsertAdmin({
			clerk_id: data.id,
		});
	},
	"user.updated": async (data: UserJSON) => {
		await upsertAdmin({
			clerk_id: data.id,
		});
	},
	"user.deleted": async (data: UserDeletedJSON) => {
		if (!data.id) return;

		await deleteAdmin({
			clerk_id: data.id,
		});
	},
};

export const POST = createApi({
	execute: async ({ req }) => {
		const signingSecret = SERVER_ENV.ADMIN_CLERK_SIGNING_SECRET;

		if (!signingSecret) {
			throw new ApiError(
				"ADMIN_CLERK_SIGNING_SECRET is not configured.",
				500,
			);
		}

		const { type, data } = await verifyWebhook(req, {
			signingSecret,
		});

		if (type === "user.created" || type === "user.updated") {
			await WebhookEventHandlers[type](data as unknown as UserJSON);
			console.log("Admin created or updated");
		} else if (type === "user.deleted") {
			await WebhookEventHandlers[type](data);
			console.log("Admin deleted");
		}

		return sendJsonApiResponse({
			success: true,
			code: 200,
		});
	},
});
