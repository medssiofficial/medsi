import z from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ACCESS_DENIED_URL, DASHBOARD_URL } from "@/config/client-constants";

export const LoginFormSchema = z.object({
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

export type LoginFormValues = z.infer<typeof LoginFormSchema>;

const getClerkErrorCode = (error: unknown) => {
	if (
		typeof error === "object" &&
		error !== null &&
		"errors" in error &&
		Array.isArray((error as { errors: unknown }).errors)
	) {
		const first = (
			error as { errors: Array<{ code?: unknown; message?: unknown }> }
		).errors[0];
		if (first && typeof first.code === "string") {
			return first.code;
		}
	}

	return null;
};

const getClerkErrorMessage = (error: unknown) => {
	if (
		typeof error === "object" &&
		error !== null &&
		"errors" in error &&
		Array.isArray((error as { errors: unknown }).errors)
	) {
		const first = (error as { errors: Array<{ message?: unknown }> })
			.errors[0];
		if (first && typeof first.message === "string") {
			return first.message;
		}
	}

	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof (error as { message?: unknown }).message === "string"
	) {
		return (error as { message: string }).message;
	}

	return "Sign in failed.";
};

export const useSignInScreen = () => {
	const router = useRouter();
	const { signIn } = useSignIn();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSignIn = async () => {
		if (isLoading) return;

		const parsed = LoginFormSchema.safeParse({ email, password });
		if (!parsed.success) {
			toast.error(parsed.error.issues[0]?.message ?? "Invalid form.");
			return;
		}

		if (!signIn) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		setIsLoading(true);

		try {
			const result = await signIn.create({
				identifier: parsed.data.email,
				password: parsed.data.password,
			});

			if (
				result &&
				typeof result === "object" &&
				"status" in result &&
				result.status === "complete" &&
				"createdSessionId" in result &&
				typeof result.createdSessionId === "string"
			) {
				const meResponse = await fetch("/api/admin/me", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (meResponse.status === 403 || meResponse.status === 404) {
					toast.error("Access denied.");
					router.replace(ACCESS_DENIED_URL);
					return;
				}

				if (!meResponse.ok) {
					toast.error("Sign in failed.");
					return;
				}

				toast.success("Signed in successfully.");
				router.replace(DASHBOARD_URL);
				return;
			}

			toast.error("Sign in failed.");
		} catch (error: unknown) {
			const code = getClerkErrorCode(error);
			if (code === "form_identifier_not_found") {
				toast.error("Account not found.");
				router.replace(ACCESS_DENIED_URL);
				return;
			}

			toast.error(getClerkErrorMessage(error));
		} finally {
			setIsLoading(false);
		}
	};

	return {
		email,
		password,
		setEmail,
		setPassword,
		isLoading,
		handleSignIn,
	};
};
