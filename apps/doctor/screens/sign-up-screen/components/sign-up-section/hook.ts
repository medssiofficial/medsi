import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import z from "zod";
import { useState } from "react";
import { toast } from "sonner";

const SignUpSchema = z.object({
	email: z.email({
		error: "Please enter a valid email address.",
	}),
	otp: z
		.string({
			error: "Please enter a valid OTP.",
		})
		.trim()
		.min(6, {
			error: "OTP must be at least 6 characters long.",
		})
		.max(6, {
			error: "OTP must be at most 6 characters long.",
		})
		.optional(),
});

type SignUpFormValues = z.infer<typeof SignUpSchema>;

export const useSignUpSection = () => {
	const router = useRouter();

	const [step, setStep] = useState<"email" | "otp">("email");
	const [isLoading, setIsLoading] = useState(false);
	const [isResendingOtp, setIsResendingOtp] = useState(false);

	const signUpForm = useForm<SignUpFormValues>({
		resolver: zodResolver(SignUpSchema),
		defaultValues: {
			email: "",
			otp: "",
		},
		mode: "onBlur",
	});

	const { signUp } = useSignUp();

	const handleEmailSubmit = async () => {
		if (isLoading) return;
		if (!signUp) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		setIsLoading(true);

		const { error: signUpCreateError } = await signUp.create({
			emailAddress: signUpForm.getValues("email"),
		});

		if (signUpCreateError) {
			setIsLoading(false);
			toast.error(signUpCreateError.message);
			return;
		}

		const { error: sendEmailCodeError } =
			await signUp.verifications.sendEmailCode();

		setIsLoading(false);

		if (sendEmailCodeError) {
			toast.error(sendEmailCodeError.message);
			return;
		}

		toast.success("OTP sent to your email.");
		setStep("otp");
	};

	const handleOTPSubmit = async () => {
		if (isLoading) return;
		if (!signUp) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		const otp = signUpForm.getValues("otp");

		if (!otp || otp.length !== 6) {
			signUpForm.setError("otp", {
				message: "Please enter the 6-digit OTP sent to your email.",
			});
			return;
		}

		setIsLoading(true);

		const { error: verifyEmailCodeError } = await signUp.verifications.verifyEmailCode({
				code: otp,
			});

		setIsLoading(false);

		if (verifyEmailCodeError) {
			toast.error(verifyEmailCodeError.message);
			return;
		}

		toast.success("Account created successfully.");
		router.replace("/onboard");
		router.refresh();
		window.setTimeout(() => {
			window.location.assign("/onboard");
		}, 120);
	};

	const handleFormSubmit = async () => {
		if (step === "email") {
			const isValid = await signUpForm.trigger("email");
			if (!isValid) return;
			await handleEmailSubmit();
		} else {
			const isValid = await signUpForm.trigger("otp");
			if (!isValid) return;
			await handleOTPSubmit();
		}
	};

	const handleResendOTP = async () => {
		if (isResendingOtp) return;
		if (!signUp) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		setIsResendingOtp(true);

		const { error } = await signUp.verifications.sendEmailCode();

		setIsResendingOtp(false);

		if (error) {
			toast.error(error.message);
			return;
		}

		toast.success("OTP resent.");
	};

	const handleBack = () => {
		setStep("email");
		signUpForm.setValue("otp", "");
		signUpForm.clearErrors("otp");
	};

	return {
		signUpForm,
		currentStep: step,
		isLoading,
		isResendingOtp,
		handleFormSubmit,
		handleResendOTP,
		handleBack,
	};
};
