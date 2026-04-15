import { createApi, sendJsonApiResponse } from "@repo/utils/server";

export const GET = createApi({
	execute: async () => {
		return sendJsonApiResponse({
			success: true,
			code: 200,
			message: "Admin APIs are running",
		});
	},
});
