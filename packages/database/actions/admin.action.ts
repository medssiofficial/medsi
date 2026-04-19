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

export const getAllAdmins = () => {
	return prisma.admin.findMany();
};

interface CreateManyAdminsArgs {
	clerk_ids: string[];
}

export const createManyAdmins = (args: CreateManyAdminsArgs) => {
	return prisma.admin.createMany({
		data: args.clerk_ids.map((clerk_id) => ({
			clerk_id,
		})),
	});
};
