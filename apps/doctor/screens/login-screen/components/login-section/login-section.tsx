"use client";

import { Card } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@repo/ui/components/ui/input-otp";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/ui/form";
import { Separator } from "@repo/ui/components/ui/separator";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { ArrowRightIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useLoginSection } from "./hook";

const LoginSection = () => {
	const {
		loginForm,
		currentStep,
		isLoading,
		isResendingOtp,
		handleFormSubmit,
		handleResendOTP,
		handleBack,
	} = useLoginSection();

	return (
		<div className="flex-1 min-h-screen bg-grey-50 flex flex-col items-center justify-center">
			<Card className="w-full max-w-110 bg-background flex flex-col px-6 py-8 gap-6">
				{/* ── Header ── */}
				<div className="flex flex-col gap-1.5">
					<p className="font-heading text-2xl font-semibold">
						{currentStep === "email"
							? "Doctor Panel Access"
							: "Verify your email"}
					</p>
					<p className="text-muted-foreground text-sm">
						{currentStep === "email" ? (
							"Enter the required credentials to access the doctor panel."
						) : (
							<>
								We sent a 6-digit code to{" "}
								<span className="font-medium text-foreground">
									{loginForm.getValues("email")}
								</span>
								. Check your inbox.
							</>
						)}
					</p>
				</div>

				<Separator />

				{/* ── Form ── */}
				<Form {...loginForm}>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleFormSubmit();
						}}
						className="flex flex-col gap-5"
					>
						<FormField
							control={loginForm.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="doctor@clinic.com"
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

						{currentStep === "otp" && (
							<FormField
								control={loginForm.control}
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
						)}

						<Button
							type="submit"
							size="lg"
							className="w-full"
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

						{currentStep === "otp" && (
							<p className="text-center text-sm text-muted-foreground">
								{"Didn't receive it? "}
								<Button
									variant="link"
									type="button"
									className="h-auto p-0 text-sm font-medium"
									disabled={isResendingOtp}
									onClick={handleResendOTP}
								>
									Resend OTP
								</Button>
							</p>
						)}
					</form>
				</Form>

				{/* ── Footer ── */}
				{currentStep === "email" ? (
					<p className="text-center text-sm text-muted-foreground">
						{"Don't have an account? "}
						<Link
							href="/sign-up"
							className="font-medium text-foreground underline-offset-4 hover:underline"
						>
							Sign up
						</Link>
					</p>
				) : (
					<Button
						variant="ghost"
						size="sm"
						type="button"
						className="-ml-2.5 self-start text-muted-foreground hover:text-foreground"
						disabled={isLoading}
						onClick={handleBack}
					>
						<ArrowLeftIcon />
						Change email
					</Button>
				)}
			</Card>
		</div>
	);
};

export default LoginSection;
