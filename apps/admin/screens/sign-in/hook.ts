import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ACCESS_DENIED_URL, DASHBOARD_URL } from "@/config/client-constants";

export const LoginFormSchema = z.object({
	email: z.email({
		error: "Please provide a valid email address.",
	}),
	otp: z
		.string({
			error: "Please provide a valid OTP.",
		})
		.trim()
		.length(6, {
			error: "OTP must be 6 digits long.",
		})
		.optional(),
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;

const getClerkErrorDetails = (input: unknown) => {
	if (typeof input !== "object" || input === null) {
		return { code: null, status: null, message: "Sign in failed." };
	}

	const root = input as {
		code?: unknown;
		status?: unknown;
		statusCode?: unknown;
		message?: unknown;
		errors?: unknown;
	};

	const status =
		typeof root.status === "number"
			? root.status
			: typeof root.statusCode === "number"
				? root.statusCode
				: null;

	let code: string | null = typeof root.code === "string" ? root.code : null;
	let message: string | null =
		typeof root.message === "string" ? root.message : null;

	if (Array.isArray(root.errors) && root.errors.length > 0) {
		const first = root.errors[0] as {
			code?: unknown;
			message?: unknown;
		};

		if (typeof first.code === "string") {
			code = first.code;
		}

		if (typeof first.message === "string") {
			message = first.message;
		}
	}

	return { code, status, message: message ?? "Sign in failed." };
};

export const useSignInScreen = () => {
	const router = useRouter();
	const { setActive } = useClerk();
	const { signIn } = useSignIn();

	const signInForm = useForm<LoginFormValues>({
		resolver: zodResolver(LoginFormSchema),
		defaultValues: {
			email: "",
			otp: "",
		},
		mode: "onSubmit",
	});

	const [currentStep, setCurrentStep] = useState<"email" | "otp">("email");
	const [isLoading, setIsLoading] = useState(false);
	const [isResendingOtp, setIsResendingOtp] = useState(false);

	const redirectAccessDenied = () => {
		router.replace(ACCESS_DENIED_URL);
	};

	const handleEmailSubmit = async () => {
		if (isLoading) return;

		const isValid = await signInForm.trigger("email");
		if (!isValid) return;

		if (!signIn) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		const email = signInForm.getValues("email");
		setIsLoading(true);

		const createResult = await signIn.create({
			identifier: email,
		});

		if (createResult.error) {
			const { code, status, message } = getClerkErrorDetails(createResult.error);
			setIsLoading(false);

			if (
				(status === 422 && code === "form_identifier_not_found") ||
				code === "form_identifier_not_found"
			) {
				toast.error("Account not found.");
				redirectAccessDenied();
				return;
			}

			toast.error(message);
			return;
		}

		const sendCodeResult = await signIn.emailCode.sendCode();

		setIsLoading(false);

		if (sendCodeResult.error) {
			const { message } = getClerkErrorDetails(sendCodeResult.error);
			toast.error(message);
			return;
		}

		toast.success("OTP sent to your email.");
		setCurrentStep("otp");
	};

	const handleOtpSubmit = async () => {
		if (isLoading) return;

		if (!signIn) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		const isValid = await signInForm.trigger("otp");
		if (!isValid) return;

		const otp = signInForm.getValues("otp");
		if (!otp) {
			signInForm.setError("otp", {
				message: "Please enter the 6-digit OTP sent to your email.",
			});
			return;
		}

		setIsLoading(true);

		const verifyResult = await signIn.emailCode.verifyCode({
			code: otp,
		});

		if (verifyResult.error) {
			const { code, status, message } = getClerkErrorDetails(verifyResult.error);
			setIsLoading(false);

			if (
				(status === 422 && code === "form_identifier_not_found") ||
				code === "form_identifier_not_found"
			) {
				toast.error("Account not found.");
				redirectAccessDenied();
				return;
			}

			toast.error(message);
			return;
		}

		const createdSessionId =
			(verifyResult as { createdSessionId?: string | null }).createdSessionId ??
			(signIn as unknown as { createdSessionId?: string | null })
				.createdSessionId ??
			null;

		if (createdSessionId) {
			await setActive({ session: createdSessionId });
		}

		setIsLoading(false);
		toast.success("Signed in successfully.");
		router.replace(DASHBOARD_URL);
		router.refresh();
	};

	const handleFormSubmit = async () => {
		if (currentStep === "email") {
			await handleEmailSubmit();
			return;
		}

		await handleOtpSubmit();
	};

	const handleResendOtp = async () => {
		if (isResendingOtp) return;
		if (!signIn) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		setIsResendingOtp(true);
		const resendResult = await signIn.emailCode.sendCode();
		setIsResendingOtp(false);

		if (resendResult.error) {
			const { message } = getClerkErrorDetails(resendResult.error);
			toast.error(message);
			return;
		}

		toast.success("OTP resent.");
	};

	const handleChangeEmail = () => {
		if (isLoading) return;
		setCurrentStep("email");
		signInForm.setValue("otp", "");
		signInForm.clearErrors("otp");
	};

	return {
		signInForm,
		currentStep,
		isLoading,
		isResendingOtp,
		handleFormSubmit,
		handleResendOtp,
		handleChangeEmail,
	};
};
