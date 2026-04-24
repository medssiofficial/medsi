import { prisma } from "../client";

interface UpsertDoctorArgs {
	clerk_id: string;
	verified?: boolean;
}

export const upsertDoctor = (args: UpsertDoctorArgs) => {
	const updateData: { verified?: boolean } = {};

	if (typeof args.verified === "boolean") {
		updateData.verified = args.verified;
	}

	return prisma.doctor.upsert({
		where: {
			clerk_id: args.clerk_id,
		},
		create: {
			clerk_id: args.clerk_id,
			verified: args.verified ?? false,
		},
		update: updateData,
	});
};

interface DeleteDoctorArgs {
	clerk_id: string;
}

export const deleteDoctor = (args: DeleteDoctorArgs) => {
	return prisma.doctor.deleteMany({
		where: {
			clerk_id: args.clerk_id,
		},
	});
};

interface GetDoctorFullByClerkIdArgs {
	clerk_id: string;
}

export const getDoctorFullByClerkId = async (
	args: GetDoctorFullByClerkIdArgs,
) => {
	return prisma.doctor.findUnique({
		where: {
			clerk_id: args.clerk_id,
		},
		include: {
			profile: true,
			specializations: true,
			experiences: true,
			expertises: true,
		},
	});
};
