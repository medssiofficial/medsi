import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const RESEND_SECONDS = 42;

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

export const useLoginSection = () => {
	const [step, setStep] = useState<"email" | "otp">("email");
	const [resendCountdown, setResendCountdown] = useState(RESEND_SECONDS);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const loginForm = useForm<LoginFormValues>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			otp: "",
		},
		mode: "onSubmit",
	});

	const otpValue = useWatch({
		control: loginForm.control,
		name: "otp",
	});

	useEffect(() => {
		if (step != "otp") return;
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
		const isValid = await loginForm.trigger("email");
		if (!isValid) return;

		setStep("otp");
		setResendCountdown(RESEND_SECONDS);
		loginForm.clearErrors("otp");
		toast.success("OTP sent to your email.");
	};

	const handleVerify = async () => {
		const isValid = await loginForm.trigger("otp");
		if (!isValid) return;

		setIsSubmitting(true);
		await new Promise((resolve) => window.setTimeout(resolve, 500));
		setIsSubmitting(false);
		toast.success("OTP verified. Auth flow will be connected next.");
	};

	const handlePrimaryAction = async () => {
		if (step == "email") {
			await handleContinue();
			return;
		}

		await handleVerify();
	};

	const handleResend = () => {
		if (resendCountdown > 0) return;
		setResendCountdown(RESEND_SECONDS);
		toast.success("New OTP sent.");
	};

	const handleBack = () => {
		setStep("email");
		loginForm.setValue("otp", "");
		loginForm.clearErrors("otp");
	};

	const handleGoogleSignIn = () => {
		toast.info("Google auth will be connected in next step.");
	};

	const handleAppleSignIn = () => {
		toast.info("Apple auth will be connected in next step.");
	};

	return {
		loginForm,
		currentStep: step,
		isSubmitting,
		handlePrimaryAction,
		handleBack,
		handleResend,
		handleGoogleSignIn,
		handleAppleSignIn,
		resendLabel,
		canResend: resendCountdown <= 0,
		otpValue: otpValue ?? "",
	};
};
