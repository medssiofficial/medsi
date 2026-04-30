import {
	getPatientFilesByClerkId,
	uploadPatientFileByClerkId,
} from "@repo/database/actions/patient";
import { createApi, sendJsonApiResponse } from "@repo/utils/server";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import z from "zod";

const ALLOWED_UPLOAD_TYPES = new Set([
	"application/pdf",
	"image/png",
	"image/jpeg",
	"image/webp",
	"text/plain",
]);
const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

const QuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(30).default(12),
	cursor: z.string().optional(),
	search: z.string().optional(),
});

export const GET = createApi({
	requireAuth: true,
	querySchema: QuerySchema,
	execute: async ({ user, query }) => {
		const result = await getPatientFilesByClerkId({
			clerk_id: user.id,
			limit: query.limit,
			cursor: query.cursor,
			search: query.search,
		});

		return sendJsonApiResponse({
			success: true,
			code: 200,
			data: result,
		});
	},
});

export const POST = async (req: NextRequest) => {
	try {
		const { userId, isAuthenticated } = await auth();

		if (!isAuthenticated || !userId) {
			return sendJsonApiResponse({
				success: false,
				error: "Unauthorized",
				code: 401,
			});
		}

		const formData = await req.formData();
		const fileValue = formData.get("file");

		if (!(fileValue instanceof File)) {
			return sendJsonApiResponse({
				success: false,
				error: "Please provide a file.",
				code: 400,
			});
		}

		if (!fileValue.size) {
			return sendJsonApiResponse({
				success: false,
				error: "Uploaded file is empty.",
				code: 400,
			});
		}

		if (fileValue.size > MAX_UPLOAD_SIZE_BYTES) {
			return sendJsonApiResponse({
				success: false,
				error: "File size exceeds 20MB limit.",
				code: 400,
			});
		}

		if (!ALLOWED_UPLOAD_TYPES.has(fileValue.type)) {
			return sendJsonApiResponse({
				success: false,
				error: "Unsupported file type.",
				code: 400,
			});
		}

		const uploaded = await uploadPatientFileByClerkId({
			clerk_id: userId,
			file: fileValue,
		});

		return sendJsonApiResponse({
			success: true,
			code: 201,
			data: {
				file: uploaded,
			},
		});
	} catch (error) {
		return sendJsonApiResponse({
			success: false,
			error: error instanceof Error ? error.message : "File upload failed.",
			code: 500,
		});
	}
};
