import { task } from "@trigger.dev/sdk";

/**
 * Sanity-check task for local `trigger dev` and deploy wiring.
 * Replace or extend with real admin background work as needed.
 */
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
