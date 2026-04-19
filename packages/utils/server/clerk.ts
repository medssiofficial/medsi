import { createClerkClient, User } from "@clerk/nextjs/server";

interface ClerkClientArgs {
	secretKey: string;
	publishableKey: string;
}

export class Clerk {
	private client: ReturnType<typeof createClerkClient>;

	constructor(args: ClerkClientArgs) {
		this.client = createClerkClient({
			secretKey: args.secretKey,
			publishableKey: args.publishableKey,
		});
	}

	getClient(): ReturnType<typeof createClerkClient> {
		return this.client;
	}

	async getUsersIds() {
		const users: User[] = [];

		let offset = 0;

		while (true) {
			const fetchedUsers = await this.client.users.getUserList({
				offset,
				limit: 100,
			});

			users.push(...fetchedUsers.data);
			offset += fetchedUsers.totalCount;

			if (users.length < 100) {
				break;
			}
		}

		return users.map((user) => user.id);
	}
}
