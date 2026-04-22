import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import z from "zod";
import { useState } from "react";
import { toast } from "sonner";

const LoginFormSchema = z.object({
	email: z.email({
		error: "Please provide a valid email address.",
	}),
	otp: z
		.string({
			error: "Please provide a valid OTP.",
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

type LoginFormValues = z.infer<typeof LoginFormSchema>;

export const useLoginSection = () => {
	const router = useRouter();

	const [step, setStep] = useState<"email" | "otp">("email");
	const [isLoading, setIsLoading] = useState(false);
	const [isResendingOtp, setIsResendingOtp] = useState(false);

	const loginForm = useForm<LoginFormValues>({
		resolver: zodResolver(LoginFormSchema),
		defaultValues: {
			email: "",
			otp: "",
		},
		mode: "onSubmit",
	});

	const { signIn } = useSignIn();

	const handleEmailSubmit = async () => {
		if (isLoading) return;

		setIsLoading(true);

		toast.success("Signing in...");

		console.log(
			"Attempting signIn.create with identifier:",
			loginForm.getValues("email"),
		);
		const { error: signInCreateError } = await signIn.create({
			identifier: loginForm.getValues("email"),
		});

		if (signInCreateError) {
			console.log("signIn.create result:", signInCreateError);
			setIsLoading(false);
			// TODO: Implement Toaster here
			console.log(
				"Calling toast.error with message:",
				signInCreateError.message,
			);
			toast.error(signInCreateError.message);
			return;
		}

		const { error: sendEmailCodeError } = await signIn.emailCode.sendCode();

		setIsLoading(false);

		if (sendEmailCodeError) {
			// TODO: Implement Toaster here
			console.error(sendEmailCodeError.message);
			return;
		}

		setStep("otp");
	};

	const handleOTPSubmit = async () => {
		if (isLoading) return;

		const otp = loginForm.getValues("otp");

		if (!otp || otp.length !== 6) {
			loginForm.setError("otp", {
				message: "Please enter the 6-digit OTP sent to your email.",
			});
			return;
		}

		setIsLoading(true);

		const { error: verifyEmailCodeError } =
			await signIn.emailCode.verifyCode({
				code: otp,
			});

		setIsLoading(false);

		if (verifyEmailCodeError) {
			// TODO: Implement Toaster here
			console.error(verifyEmailCodeError.message);
			return;
		}

		// TODO: Redirect to dashboard after successful login
		router.push("/dashboard");
	};

	const handleFormSubmit = async () => {
		if (step === "email") {
			const isValid = await loginForm.trigger("email");
			if (!isValid) return;
			await handleEmailSubmit();
		} else {
			const isValid = await loginForm.trigger("otp");
			if (!isValid) return;
			await handleOTPSubmit();
		}
	};

	const handleResendOTP = async () => {
		if (isResendingOtp) return;

		setIsResendingOtp(true);

		const { error } = await signIn.emailCode.sendCode();

		setIsResendingOtp(false);

		if (error) {
			// TODO: Implement Toaster here
			console.error(error.message);
			return;
		}

		// TODO: Implement a success toast here
	};

	const handleBack = () => {
		setStep("email");
		loginForm.setValue("otp", "");
		loginForm.clearErrors("otp");
	};

	return {
		loginForm,
		currentStep: step,
		isLoading,
		isResendingOtp,
		handleFormSubmit,
		handleResendOTP,
		handleBack,
	};
};
