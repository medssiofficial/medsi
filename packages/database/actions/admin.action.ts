import { prisma } from "../client";

interface CreateAdminArgs {
	clerk_id: string;
}

export const createAdmin = (args: CreateAdminArgs) => {
	return prisma.admin.create({
		data: {
			clerk_id: args.clerk_id,
		},
	});
};
