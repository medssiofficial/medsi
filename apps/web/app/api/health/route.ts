import { sendJsonApiResponse } from "@repo/utils/server";

export const GET = async () => {
	return sendJsonApiResponse({
		success: true,
		code: 200,
		data: { status: "ok" },
	});
};
