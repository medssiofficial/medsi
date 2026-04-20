import { serverUtilsRegistry } from "@/utils/server";
import { createManyAdmins, getAllAdmins } from "@repo/database/actions/admin";
import { logger } from "@repo/utils/server";

const syncAdmin = async () => {
	const admins = await getAllAdmins();

	const adminIdsSet = new Set(admins.map((admin) => admin.id));

	const clerkAdmins = await serverUtilsRegistry.clerk.getUsersIds();

	const adminsTobeCreated: string[] = [];

	for (const cAdmin of clerkAdmins) {
		if (!adminIdsSet.has(cAdmin)) {
			adminsTobeCreated.push(cAdmin);
		}
	}

	await createManyAdmins({
		clerk_ids: adminsTobeCreated,
	});

	logger.info("✅ Admins are now in sync!");
	process.exit(0);
};

syncAdmin();
