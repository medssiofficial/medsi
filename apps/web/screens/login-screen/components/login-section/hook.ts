import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
	DASHBOARD_URL,
	SSO_CALLBACK_URL,
} from "@/config/client-constants";

const RESEND_SECONDS = 42;
const LOGIN_FLOW_STORAGE_KEY = "web.auth.login.flow";

const LoginSchema = z.object({
	email: z.email({
		error: "Please provide a valid email address.",
	}),
	otp: z
		.string()
		.trim()
		.min(6, {
			error: "OTP must be 6 digits.",
		})
		.max(6, {
			error: "OTP must be 6 digits.",
		})
		.optional(),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

const getSavedLoginFlow = () => {
	if (typeof window === "undefined") return null;

	try {
		const raw = window.sessionStorage.getItem(LOGIN_FLOW_STORAGE_KEY);
		if (!raw) return null;

		return JSON.parse(raw) as {
			step?: "email" | "otp";
			email?: string;
			otp?: string;
		};
	} catch {
		return null;
	}
};

const getClerkErrorCode = (error: unknown) => {
	if (!error || typeof error !== "object") return null;
	if (!("errors" in error)) return null;

	const errors = (error as { errors?: unknown }).errors;
	if (!Array.isArray(errors) || errors.length === 0) return null;

	const first = errors[0];
	if (!first || typeof first !== "object") return null;
	if (!("code" in first)) return null;

	const code = (first as { code?: unknown }).code;
	return typeof code === "string" ? code : null;
};

const getClerkErrorMessage = (error: unknown) => {
	if (!error || typeof error !== "object") return null;
	if (!("errors" in error)) return null;

	const errors = (error as { errors?: unknown }).errors;
	if (!Array.isArray(errors) || errors.length === 0) return null;

	const first = errors[0];
	if (!first || typeof first !== "object") return null;
	if (!("message" in first)) return null;

	const message = (first as { message?: unknown }).message;
	return typeof message === "string" ? message : null;
};

export const useLoginSection = () => {
	const router = useRouter();
	const { isSignedIn } = useAuth();
	const clerk = useClerk();
	const { setActive } = clerk;
	const { signIn } = useSignIn();
	const savedFlow = getSavedLoginFlow();

	const [step, setStep] = useState<"email" | "otp">(
		savedFlow?.step === "otp" ? "otp" : "email",
	);
	const [resendCountdown, setResendCountdown] = useState(RESEND_SECONDS);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

	const loginForm = useForm<LoginFormValues>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: savedFlow?.email ?? "",
			otp: savedFlow?.otp ?? "",
		},
		mode: "onSubmit",
	});

	const emailValue = useWatch({ control: loginForm.control, name: "email" });
	const otpValue = useWatch({ control: loginForm.control, name: "otp" });

	useEffect(() => {
		window.sessionStorage.setItem(
			LOGIN_FLOW_STORAGE_KEY,
			JSON.stringify({
				step,
				email: emailValue ?? "",
				otp: otpValue ?? "",
			}),
		);
	}, [emailValue, otpValue, step]);

	useEffect(() => {
		if (step !== "otp") return;
		if (resendCountdown <= 0) return;

		const timer = window.setInterval(() => {
			setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
		}, 1000);

		return () => window.clearInterval(timer);
	}, [resendCountdown, step]);

	const resendLabel = useMemo(() => {
		const minutes = Math.floor(resendCountdown / 60)
			.toString()
			.padStart(1, "0");
		const seconds = (resendCountdown % 60).toString().padStart(2, "0");
		return `${minutes}:${seconds}`;
	}, [resendCountdown]);

	const handleContinue = async () => {
		if (!signIn) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		const isValid = await loginForm.trigger("email");
		if (!isValid) return;

		setIsSubmitting(true);

		const { error: signInCreateError } = await signIn.create({
			identifier: loginForm.getValues("email"),
		});

		if (signInCreateError) {
			setIsSubmitting(false);
			const message =
				getClerkErrorMessage(signInCreateError) ??
				signInCreateError.message ??
				"Unable to continue with this email.";
			loginForm.setError("email", { message });
			toast.error(message);
			return;
		}

		const { error: sendEmailCodeError } = await signIn.emailCode.sendCode();
		setIsSubmitting(false);

		if (sendEmailCodeError) {
			const message =
				getClerkErrorMessage(sendEmailCodeError) ??
				sendEmailCodeError.message ??
				"Unable to send OTP to this email.";
			loginForm.setError("email", { message });
			toast.error(message);
			return;
		}

		setStep("otp");
		setResendCountdown(RESEND_SECONDS);
		loginForm.clearErrors("otp");
		toast.success("OTP sent to your email.");
	};

	const handleVerify = async () => {
		if (!signIn) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		const isValid = await loginForm.trigger("otp");
		if (!isValid) return;

		setIsSubmitting(true);
		const verifyResult = await signIn.emailCode.verifyCode({
			code: loginForm.getValues("otp") ?? "",
		});
		setIsSubmitting(false);

		if (verifyResult.error) {
			const message =
				getClerkErrorMessage(verifyResult.error) ??
				verifyResult.error.message ??
				"Invalid OTP. Please try again.";
			loginForm.setError("otp", { message });
			toast.error(message);
			return;
		}

		const createdSessionId =
			(verifyResult as { createdSessionId?: string | null }).createdSessionId ??
			null;

		if (createdSessionId) {
			await setActive({ session: createdSessionId });
		}

		window.sessionStorage.removeItem(LOGIN_FLOW_STORAGE_KEY);
		toast.success("Signed in successfully.");
		router.replace(DASHBOARD_URL);
	};

	const handlePrimaryAction = async () => {
		if (step === "email") {
			await handleContinue();
			return;
		}

		await handleVerify();
	};

	const handleResend = async () => {
		if (!signIn) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		if (resendCountdown > 0) return;

		const { error } = await signIn.emailCode.sendCode();
		if (error) {
			const message =
				getClerkErrorMessage(error) ??
				error.message ??
				"Unable to resend OTP right now.";
			loginForm.setError("email", { message });
			toast.error(message);
			return;
		}

		setResendCountdown(RESEND_SECONDS);
		toast.success("New OTP sent.");
	};

	const handleBack = () => {
		setStep("email");
		loginForm.setValue("otp", "");
		loginForm.clearErrors("otp");
	};

	const handleGoogleSignIn = async () => {
		if (isGoogleSubmitting) return;

		const clerkClient = (clerk as unknown as {
			client?: {
				signIn?: {
					authenticateWithRedirect?: (params: {
						strategy: "oauth_google";
						redirectUrl: string;
						redirectUrlComplete: string;
					}) => Promise<void>;
				};
			};
		}).client;

		const legacySignIn = clerkClient?.signIn;

		if (!legacySignIn?.authenticateWithRedirect) {
			console.error("[GoogleSignIn] Clerk client.signIn unavailable", {
				clerkLoaded: clerk?.loaded,
				hasClient: Boolean(clerkClient),
			});
			toast.error("Authentication is not ready yet. Please refresh and retry.");
			return;
		}

		try {
			setIsGoogleSubmitting(true);

			const origin =
				typeof window !== "undefined" ? window.location.origin : "";
			const redirectUrl = `${origin}${SSO_CALLBACK_URL}`;
			const redirectUrlComplete = `${origin}${DASHBOARD_URL}`;

			console.info("[GoogleSignIn] Initiating OAuth", {
				redirectUrl,
				redirectUrlComplete,
			});

			await legacySignIn.authenticateWithRedirect({
				strategy: "oauth_google",
				redirectUrl,
				redirectUrlComplete,
			});
		} catch (error) {
			console.error("[GoogleSignIn] Failed", error);
			const errorCode = getClerkErrorCode(error);
			if (errorCode === "too_many_requests") {
				toast.error(
					"Too many requests. Please wait a bit before trying Google sign-in again.",
				);
			} else {
				toast.error(
					getClerkErrorMessage(error) ??
						(error instanceof Error
							? error.message
							: "Google sign-in failed."),
				);
			}
			setIsGoogleSubmitting(false);
		}
	};

	const handleAppleSignIn = () => {
		toast.info("Apple sign-in is coming soon.");
	};

	return {
		loginForm,
		emailValue,
		currentStep: step,
		isSubmitting,
		handlePrimaryAction,
		handleBack,
		handleResend,
		handleGoogleSignIn,
		handleAppleSignIn,
		resendLabel,
		canResend: resendCountdown <= 0,
		isSignedIn,
		isGoogleSubmitting,
	};
};
