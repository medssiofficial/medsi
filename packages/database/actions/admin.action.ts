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

interface UpsertAdminArgs {
	clerk_id: string;
}

export const upsertAdmin = (args: UpsertAdminArgs) => {
	return prisma.admin.upsert({
		where: {
			clerk_id: args.clerk_id,
		},
		create: {
			clerk_id: args.clerk_id,
		},
		update: {},
	});
};

export const getAllAdmins = () => {
	return prisma.admin.findMany();
};

interface GetAdminByClerkIdArgs {
	clerk_id: string;
}

export const getAdminByClerkId = (args: GetAdminByClerkIdArgs) => {
	return prisma.admin.findUnique({
		where: {
			clerk_id: args.clerk_id,
		},
	});
};

interface DeleteAdminArgs {
	clerk_id: string;
}

export const deleteAdmin = async (args: DeleteAdminArgs) => {
	const admin = await prisma.admin.findUnique({
		where: {
			clerk_id: args.clerk_id,
		},
	});

	if (!admin) return;

	await prisma.admin.delete({
		where: {
			id: admin.id,
		},
	});
};

interface CreateManyAdminsArgs {
	clerk_ids: string[];
}

export const createManyAdmins = (args: CreateManyAdminsArgs) => {
	return prisma.admin.createMany({
		data: args.clerk_ids.map((clerk_id) => ({
			clerk_id,
		})),
		skipDuplicates: true,
	});
};
