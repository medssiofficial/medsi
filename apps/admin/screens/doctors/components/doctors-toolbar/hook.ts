"use client";

export const useDoctorsToolbar = (args: {
	totalDoctors: number;
	pendingApplicationsCount: number;
}) => {
	const { totalDoctors, pendingApplicationsCount } = args;

	return {
		totalDoctorsLabel: `${totalDoctors} total`,
		pendingApplicationsLabel: `${pendingApplicationsCount} pending applications`,
	};
};
