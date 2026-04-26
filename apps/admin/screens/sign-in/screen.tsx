"use client";

import { AdminLogo } from "@repo/ui/components/brand/admin";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@repo/ui/components/ui/input-otp";
import { Separator } from "@repo/ui/components/ui/separator";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useSignInScreen } from "./hook";

const SignInScreen = () => {
	const {
		signInForm,
		currentStep,
		isLoading,
		isResendingOtp,
		handleFormSubmit,
		handleResendOtp,
		handleChangeEmail,
	} = useSignInScreen();

	return (
		<div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 font-heading">
			<Card className="bg-card w-full max-w-105 px-7 py-8 flex flex-col gap-6">
				<AdminLogo size="lg" />

				<div className="flex flex-col gap-1">
					<p className="text-2xl font-medium">
						{currentStep === "email"
							? "Admin Panel Access"
							: "Verify your email"}
					</p>
					<p className="text-sm font-sans text-muted-foreground">
						{currentStep === "email" ? (
							"Enter your email address to receive a one-time login code."
						) : (
							<>
								We sent a 6-digit code to{" "}
								<span className="font-medium text-foreground">
									{signInForm.getValues("email")}
								</span>
								.
							</>
						)}
					</p>
				</div>

				<Separator />

				<Form {...signInForm}>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void handleFormSubmit();
						}}
						className="flex flex-col gap-5"
					>
						<FormField
							control={signInForm.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="admin@medssi.com"
											className="h-10 rounded-sm font-sans"
											disabled={
												isLoading ||
												currentStep === "otp"
											}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{currentStep === "otp" ? (
							<FormField
								control={signInForm.control}
								name="otp"
								render={({ field }) => (
									<FormItem>
										<FormLabel>One-time Password</FormLabel>
										<FormControl>
											<InputOTP
												maxLength={6}
												value={field.value ?? ""}
												onChange={field.onChange}
											>
												<InputOTPGroup>
													<InputOTPSlot
														index={0}
														className="size-12 text-base"
													/>
													<InputOTPSlot
														index={1}
														className="size-12 text-base"
													/>
													<InputOTPSlot
														index={2}
														className="size-12 text-base"
													/>
												</InputOTPGroup>
												<InputOTPSeparator />
												<InputOTPGroup>
													<InputOTPSlot
														index={3}
														className="size-12 text-base"
													/>
													<InputOTPSlot
														index={4}
														className="size-12 text-base"
													/>
													<InputOTPSlot
														index={5}
														className="size-12 text-base"
													/>
												</InputOTPGroup>
											</InputOTP>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						) : null}
						<Button
							size="lg"
							type="submit"
							className="h-11 rounded-sm font-sans"
							disabled={isLoading}
						>
							{isLoading ? (
								<Spinner />
							) : currentStep === "email" ? (
								<>
									Sign In
									<ArrowRightIcon />
								</>
							) : (
								"Verify Email"
							)}
						</Button>

						{currentStep === "otp" ? (
							<p className="text-center text-sm text-muted-foreground font-sans">
								{"Didn't receive it? "}
								<Button
									variant="link"
									type="button"
									className="h-auto p-0 text-sm font-medium"
									disabled={isResendingOtp}
									onClick={() => {
										void handleResendOtp();
									}}
								>
									Resend OTP
								</Button>
							</p>
						) : null}
					</form>
				</Form>

				{currentStep === "otp" ? (
					<Button
						variant="ghost"
						size="sm"
						type="button"
						className="-ml-2.5 self-start text-muted-foreground hover:text-foreground font-sans"
						disabled={isLoading}
						onClick={handleChangeEmail}
					>
						<ArrowLeftIcon />
						Change email
					</Button>
				) : null}
			</Card>
		</div>
	);
};

export default SignInScreen;
