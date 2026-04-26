import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useAuth, useClerk, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import z from "zod";
import { useEffect, useState } from "react";
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
const SIGN_UP_FLOW_STORAGE_KEY = "doctor.auth.signup.flow";

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

export const useSignUpSection = () => {
	const router = useRouter();
	const { isSignedIn } = useAuth();
	const { setActive } = useClerk();
	const savedFlow = getSavedSignUpFlow();

	const [step, setStep] = useState<"email" | "otp">(
		savedFlow?.step === "otp" ? "otp" : "email",
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isResendingOtp, setIsResendingOtp] = useState(false);
	const [redirectTo, setRedirectTo] = useState<string | null>(null);

	const signUpForm = useForm<SignUpFormValues>({
		resolver: zodResolver(SignUpSchema),
		defaultValues: {
			email: savedFlow?.email ?? "",
			otp: savedFlow?.otp ?? "",
		},
		mode: "onBlur",
	});

	const { signUp } = useSignUp();
	const emailValue = useWatch({ control: signUpForm.control, name: "email" });
	const otpValue = useWatch({ control: signUpForm.control, name: "otp" });

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
		if (!redirectTo) return;
		if (!isSignedIn) return;
		router.replace(redirectTo);
	}, [isSignedIn, redirectTo, router]);

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

		const verifyEmailCodeResult = await signUp.verifications.verifyEmailCode({
			code: otp,
		});
		const { error: verifyEmailCodeError } = verifyEmailCodeResult;

		setIsLoading(false);

		if (verifyEmailCodeError) {
			toast.error(verifyEmailCodeError.message);
			return;
		}

		const createdSessionId =
			(
				verifyEmailCodeResult as {
					createdSessionId?: string | null;
				}
			).createdSessionId ??
			(
				signUp as unknown as {
					createdSessionId?: string | null;
				}
			).createdSessionId ??
			null;

		if (createdSessionId) {
			await setActive({ session: createdSessionId });
		}

		toast.success("Account created successfully.");
		window.sessionStorage.removeItem(SIGN_UP_FLOW_STORAGE_KEY);
		setRedirectTo("/onboard");
		router.replace("/onboard");
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
