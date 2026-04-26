import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useAuth, useClerk, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import z from "zod";
import { useEffect, useState } from "react";
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
const LOGIN_FLOW_STORAGE_KEY = "doctor.auth.login.flow";

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

export const useLoginSection = () => {
	const router = useRouter();
	const { isSignedIn } = useAuth();
	const { setActive } = useClerk();
	const savedFlow = getSavedLoginFlow();

	const [step, setStep] = useState<"email" | "otp">(
		savedFlow?.step === "otp" ? "otp" : "email",
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isResendingOtp, setIsResendingOtp] = useState(false);
	const [redirectTo, setRedirectTo] = useState<string | null>(null);

	const loginForm = useForm<LoginFormValues>({
		resolver: zodResolver(LoginFormSchema),
		defaultValues: {
			email: savedFlow?.email ?? "",
			otp: savedFlow?.otp ?? "",
		},
		mode: "onSubmit",
	});

	const { signIn } = useSignIn();
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
		if (!redirectTo) return;
		if (!isSignedIn) return;
		router.replace(redirectTo);
	}, [isSignedIn, redirectTo, router]);

	const handleEmailSubmit = async () => {
		if (isLoading) return;
		if (!signIn) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		setIsLoading(true);

		const email = loginForm.getValues("email");

		const { error: signInCreateError } = await signIn.create({
			identifier: email,
		});

		if (signInCreateError) {
			setIsLoading(false);
			toast.error(signInCreateError.message);
			return;
		}

		const { error: sendEmailCodeError } = await signIn.emailCode.sendCode();

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
		if (!signIn) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		const otp = loginForm.getValues("otp");

		if (!otp || otp.length !== 6) {
			loginForm.setError("otp", {
				message: "Please enter the 6-digit OTP sent to your email.",
			});
			return;
		}

		setIsLoading(true);

		const verifyEmailCodeResult = await signIn.emailCode.verifyCode({
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
				signIn as unknown as {
					createdSessionId?: string | null;
				}
			).createdSessionId ??
			null;

		if (createdSessionId) {
			await setActive({ session: createdSessionId });
		}

		toast.success("Signed in successfully.");
		window.sessionStorage.removeItem(LOGIN_FLOW_STORAGE_KEY);
		setRedirectTo("/");
		router.replace("/");
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
		if (!signIn) {
			toast.error("Authentication is not ready yet.");
			return;
		}

		setIsResendingOtp(true);

		const { error } = await signIn.emailCode.sendCode();

		setIsResendingOtp(false);

		if (error) {
			toast.error(error.message);
			return;
		}

		toast.success("OTP resent.");
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
