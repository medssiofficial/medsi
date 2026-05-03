import { task } from "@trigger.dev/sdk";

export const helloWebTask = task({
	id: "web-hello",
	run: async (payload: { name?: string }) => {
		const name = payload.name?.trim() || "web";
		return {
			message: `Hello ${name}`,
			at: new Date().toISOString(),
		};
	},
});
