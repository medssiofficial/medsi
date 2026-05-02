import { task } from "@trigger.dev/sdk";

export const helloAdminTask = task({
	id: "admin-hello",
	run: async (payload: { name?: string }) => {
		const name = payload.name?.trim() || "admin";
		return {
			message: `Hello ${name}`,
			at: new Date().toISOString(),
		};
	},
});
