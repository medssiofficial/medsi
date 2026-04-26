import { prisma } from "../client";

interface UpsertPatientArgs {
	clerk_id: string;
}

export const upsertPatient = (args: UpsertPatientArgs) => {
	return prisma.user.upsert({
		where: {
			clerk_id: args.clerk_id,
		},
		create: {
			clerk_id: args.clerk_id,
		},
		update: {},
	});
};

interface SyncPatientProfileByClerkIdArgs {
	clerk_id: string;
	name?: string | null;
	email?: string | null;
	phone?: string | null;
	image_url?: string | null;
}

export const syncPatientProfileByClerkId = async (
	args: SyncPatientProfileByClerkIdArgs,
) => {
	const patient = await prisma.user.findUnique({
		where: {
			clerk_id: args.clerk_id,
		},
		include: {
			profile: true,
		},
	});

	if (!patient?.profile) return patient;

	await prisma.patient_profile.update({
		where: {
			user_id: patient.id,
		},
		data: {
			name: args.name ?? patient.profile.name,
			email: args.email ?? patient.profile.email,
			phone: args.phone ?? patient.profile.phone,
			// NOTE: image_url is not persisted yet because no column exists.
		},
	});

	return prisma.user.findUnique({
		where: {
			id: patient.id,
		},
		include: {
			profile: true,
		},
	});
};

interface DeletePatientArgs {
	clerk_id: string;
}

export const deletePatient = async (args: DeletePatientArgs) => {
	const patient = await prisma.user.findUnique({
		where: {
			clerk_id: args.clerk_id,
		},
	});

	if (!patient) return;

	await prisma.user.delete({
		where: {
			id: patient.id,
		},
	});
};
