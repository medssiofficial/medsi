import z from "zod";

const LoginForm = z.object({
	email: z.email({
		error: "Please provide a valid email address",
	}),
	password: z
		.string({
			error: "Please provide a valid password",
		})
		.trim()
		.min(8, {
			error: "Password must be at least 8 characters long",
		})
		.max(20, {
			error: "Password must be at most 20 characters long",
		}),
});

export const useSignInScreen = () => {};
