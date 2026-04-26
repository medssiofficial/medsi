"use client";

export const useApplicationsToolbar = (args: {
	pendingCount: number;
}) => {
	const { pendingCount } = args;

	return {
		pendingCountLabel: `${pendingCount} Pending`,
	};
};
