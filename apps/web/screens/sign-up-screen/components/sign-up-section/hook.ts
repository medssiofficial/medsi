import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, useClerk, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { ONBOARD_URL } from "@/config/client-constants";

const RESEND_SECONDS = 42;
const SIGN_UP_FLOW_STORAGE_KEY = "web.auth.signup.flow";

const SignUpSchema = z.object({
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

export type SignUpFormValues = z.infer<typeof SignUpSchema>;

const getSavedSignUpFlow = () => {
	if (typeof window === "undefined") return null;

	try {
		const raw = window.sessionStorage.getItem(SIGN_UP_FLOW_STORAGE_KEY);
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

export const useSignUpSection = () => {
	const router = useRouter();
	const { isSignedIn } = useAuth();
	const { setActive } = useClerk();
	const { signUp } = useSignUp();
	const savedFlow = getSavedSignUpFlow();

	const [step, setStep] = useState<"email" | "otp">(
		savedFlow?.step === "otp" ? "otp" : "email",
	);
	const [resendCountdown, setResendCountdown] = useState(RESEND_SECONDS);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [redirectTo, setRedirectTo] = useState<string | null>(null);

	const signUpForm = useForm<SignUpFormValues>({
		resolver: zodResolver(SignUpSchema),
		defaultValues: {
			email: savedFlow?.email ?? "",
			otp: savedFlow?.otp ?? "",
		},
		mode: "onSubmit",
	});

	const emailValue = useWatch({ control: signUpForm.control, name: "email" });
	const otpValue = useWatch({ control: signUpForm.control, name: "otp" });

	useEffect(() => {
		if (!redirectTo) return;
		if (!isSignedIn) return;
		router.replace(redirectTo);
	}, [isSignedIn, redirectTo, router]);

	useEffect(() => {
		window.sessionStorage.setItem(
			SIGN_UP_FLOW_STORAGE_KEY,
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
		if (!signUp) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		const isValid = await signUpForm.trigger("email");
		if (!isValid) return;

		setIsSubmitting(true);

		const { error: signUpCreateError } = await signUp.create({
			emailAddress: signUpForm.getValues("email"),
		});

		if (signUpCreateError) {
			setIsSubmitting(false);
			const message =
				getClerkErrorMessage(signUpCreateError) ??
				signUpCreateError.message ??
				"Unable to continue with this email.";
			signUpForm.setError("email", { message });
			toast.error(message);
			return;
		}

		const { error: sendEmailCodeError } =
			await signUp.verifications.sendEmailCode();
		setIsSubmitting(false);

		if (sendEmailCodeError) {
			const message =
				getClerkErrorMessage(sendEmailCodeError) ??
				sendEmailCodeError.message ??
				"Unable to send OTP to this email.";
			signUpForm.setError("email", { message });
			toast.error(message);
			return;
		}

		setStep("otp");
		setResendCountdown(RESEND_SECONDS);
		signUpForm.clearErrors("otp");
		toast.success("OTP sent to your email.");
	};

	const handleVerify = async () => {
		if (!signUp) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		const isValid = await signUpForm.trigger("otp");
		if (!isValid) return;

		setIsSubmitting(true);
		const verifyResult = await signUp.verifications.verifyEmailCode({
			code: signUpForm.getValues("otp") ?? "",
		});
		setIsSubmitting(false);

		if (verifyResult.error) {
			const message =
				getClerkErrorMessage(verifyResult.error) ??
				verifyResult.error.message ??
				"Invalid OTP. Please try again.";
			signUpForm.setError("otp", { message });
			toast.error(message);
			return;
		}

		const createdSessionId =
			(verifyResult as { createdSessionId?: string | null }).createdSessionId ??
			(signUp as unknown as { createdSessionId?: string | null })
				.createdSessionId ??
			null;

		if (createdSessionId) {
			await setActive({ session: createdSessionId });
		}

		toast.success("Account created successfully.");
		window.sessionStorage.removeItem(SIGN_UP_FLOW_STORAGE_KEY);
		setRedirectTo(ONBOARD_URL);
		router.replace(ONBOARD_URL);
	};

	const handlePrimaryAction = async () => {
		if (step === "email") {
			await handleContinue();
			return;
		}

		await handleVerify();
	};

	const handleResend = async () => {
		if (!signUp) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		if (resendCountdown > 0) return;

		const { error } = await signUp.verifications.sendEmailCode();
		if (error) {
			const message =
				getClerkErrorMessage(error) ??
				error.message ??
				"Unable to resend OTP right now.";
			signUpForm.setError("email", { message });
			toast.error(message);
			return;
		}

		setResendCountdown(RESEND_SECONDS);
		toast.success("New OTP sent.");
	};

	const handleBack = () => {
		setStep("email");
		signUpForm.setValue("otp", "");
		signUpForm.clearErrors("otp");
	};

	return {
		signUpForm,
		emailValue,
		currentStep: step,
		isSubmitting,
		handlePrimaryAction,
		handleBack,
		handleResend,
		resendLabel,
		canResend: resendCountdown <= 0,
		isSignedIn,
	};
};
