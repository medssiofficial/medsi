"use client";

import Link from "next/link";
import { AppleIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@repo/ui/components/ui/form";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@repo/ui/components/ui/input-otp";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { SIGN_UP_URL } from "@/config/client-constants";
import { useLoginSection } from "./hook";

const GoogleMark = () => (
	<svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
		<path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.4l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.2-3.8 9.2-9.2 0-.6-.1-1.1-.2-1.6z" />
	</svg>
);

export const LoginSection = (props: { title: string }) => {
	const { title } = props;
	const {
		loginForm,
		currentStep,
		isSubmitting,
		handlePrimaryAction,
		handleBack,
		handleResend,
		handleGoogleSignIn,
		handleAppleSignIn,
		resendLabel,
		canResend,
	} = useLoginSection();

	const emailValue = loginForm.watch("email");

	return (
		<div className="flex min-h-svh w-full justify-center bg-neutral-warm">
			<div className="flex w-full max-w-[430px] flex-col px-6 pb-8 pt-safe-top">
				{currentStep == "otp" ? (
					<div className="mb-6 pt-3">
						<Button
							variant="ghost"
							size="icon-sm"
							type="button"
							onClick={handleBack}
							className="text-foreground"
						>
							<ArrowLeftIcon className="size-5" />
						</Button>
					</div>
				) : (
					<div className="h-10" />
				)}

				<div className="flex flex-1 flex-col">
					<div className="mb-6 space-y-2">
						<h1 className="text-[28px] font-bold text-font-primary">
							{currentStep == "email" ? title : "Verify Your Email"}
						</h1>
						<p className="text-sm text-font-secondary">
							{currentStep == "email"
								? "Sign in to continue with Medssi"
								: `We've sent a 6-digit code to ${emailValue || "your email"}`}
						</p>
					</div>

					<Form {...loginForm}>
						<form
							onSubmit={(event) => {
								event.preventDefault();
								void handlePrimaryAction();
							}}
							className="flex flex-col gap-6"
						>
							{currentStep == "email" ? (
								<FormField
									control={loginForm.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													type="email"
													placeholder="you@example.com"
													className="h-13 bg-white"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							) : (
								<>
									<FormField
										control={loginForm.control}
										name="otp"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<InputOTP
														maxLength={6}
														value={field.value ?? ""}
														onChange={field.onChange}
														containerClassName="w-full justify-between"
													>
														<InputOTPGroup className="w-full justify-between gap-2 border-none">
															{Array.from({ length: 6 }).map((_, idx) => (
																<InputOTPSlot
																	key={idx}
																	index={idx}
																	className="h-14 w-12 rounded-lg border border-border bg-white text-base first:rounded-lg first:border last:rounded-lg"
																/>
															))}
														</InputOTPGroup>
													</InputOTP>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<div className="flex items-center justify-center gap-1 text-sm">
										<span className="text-font-tertiary">Resend code in</span>
										<Button
											variant="link"
											type="button"
											onClick={handleResend}
											disabled={!canResend}
											className="h-auto p-0 text-sm font-semibold text-foreground no-underline"
										>
											{canResend ? "Resend" : resendLabel}
										</Button>
									</div>
								</>
							)}

							<Button
								type="submit"
								className="h-13 w-full rounded-lg text-base"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<Spinner className="size-4" />
								) : currentStep == "email" ? (
									"Continue"
								) : (
									"Verify"
								)}
							</Button>

							{currentStep == "email" ? (
								<>
									<div className="flex items-center gap-3">
										<div className="h-px flex-1 bg-border" />
										<span className="text-sm text-font-tertiary">or</span>
										<div className="h-px flex-1 bg-border" />
									</div>

									<Button
										type="button"
										variant="outline"
										className="h-12 w-full rounded-lg bg-white"
										onClick={handleGoogleSignIn}
									>
										<GoogleMark />
										Continue with Google
									</Button>
									<Button
										type="button"
										variant="outline"
										className="h-12 w-full rounded-lg bg-white"
										onClick={handleAppleSignIn}
									>
										<AppleIcon className="size-4" />
										Continue with Apple
									</Button>
								</>
							) : null}
						</form>
					</Form>
				</div>

				<div className="pt-4 text-center text-sm text-font-tertiary">
					Don't have an account?
					<Link href={SIGN_UP_URL} className="ml-1 font-semibold text-primary">
						Sign Up
					</Link>
				</div>
			</div>
		</div>
	);
};
