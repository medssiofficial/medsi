"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
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
import { SIGN_IN_URL } from "@/config/client-constants";
import { useSignUpSection } from "./hook";

export const SignUpSection = (props: { title: string }) => {
	const { title } = props;
	const {
		signUpForm,
		emailValue,
		currentStep,
		isSubmitting,
		handlePrimaryAction,
		handleBack,
		handleResend,
		resendLabel,
		canResend,
	} = useSignUpSection();

	return (
		<div className="flex min-h-svh w-full justify-center bg-neutral-warm">
			<div className="flex w-full max-w-[430px] flex-col px-6 pb-8 pt-safe-top">
				{currentStep === "otp" ? (
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
							{currentStep === "email" ? title : "Verify Your Email"}
						</h1>
						<p className="text-sm text-font-secondary">
							{currentStep === "email"
								? "Sign up to get started with Medssi"
								: `We've sent a 6-digit code to ${emailValue || "your email"}`}
						</p>
					</div>

					<Form {...signUpForm}>
						<form
							onSubmit={(event) => {
								event.preventDefault();
								void handlePrimaryAction();
							}}
							className="flex flex-col gap-6"
						>
							{currentStep === "email" ? (
								<FormField
									control={signUpForm.control}
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
										control={signUpForm.control}
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
											onClick={() => void handleResend()}
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
								) : currentStep === "email" ? (
									"Sign Up"
								) : (
									"Verify"
								)}
							</Button>
						</form>
					</Form>
				</div>

				<div className="pt-4 text-center text-sm text-font-tertiary">
					Already have an account?
					<Link href={SIGN_IN_URL} className="ml-1 font-semibold text-primary">
						Sign In
					</Link>
				</div>

				<div id="clerk-captcha" />
			</div>
		</div>
	);
};
