import { createClerkClient } from "@clerk/backend";
import { getAllAdmins } from "@repo/database/actions/admin";

export const getAdminRecipientEmailsFromClerk = async (): Promise<string[]> => {
	const secretKey = process.env.CLERK_SECRET_KEY?.trim();
	if (!secretKey) {
		return [];
	}

	const clerk = createClerkClient({ secretKey });
	const admins = await getAllAdmins();
	const emails: string[] = [];

	for (const admin of admins) {
		try {
			const user = await clerk.users.getUser(admin.clerk_id);
			const email = user.primaryEmailAddress?.emailAddress?.trim();
			if (email) {
				emails.push(email);
			}
		} catch {
			// Skip admins that cannot be resolved (deleted Clerk user, etc.)
		}
	}

	return [...new Set(emails)];
};
