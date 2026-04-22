import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const LoginFormSchema = z.object({
	email: z.email({
		error: "Please provide a valid email address",
	}),
	otp: z
		.string({
			error: "Please provide a valid OTP",
		})
		.trim()
		.min(6, {
			error: "OTP must be at least 6 characters long",
		})
		.max(6, {
			error: "OTP must be at most 6 characters long",
		})
		.optional(),
});

export const useLoginSection = () => {
	const [activeState, setActiveState] = useState<"email" | "otp">("email");

	const form = useForm<z.infer<typeof LoginFormSchema>>({
		resolver: zodResolver(LoginFormSchema),
		defaultValues: {
			email: "",
			otp: "",
		},
	});
};
