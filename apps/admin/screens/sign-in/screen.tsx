"use client";

import { DASHBOARD_URL, SIGN_IN_URL } from "@/config/client-constants";
import { SignIn } from "@clerk/nextjs";
import { AdminLogo } from "@repo/ui/components/brand/admin";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";

const SignInScreen = () => {
	return (
		<div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 font-heading">
			<Card className="bg-card px-7 py-10 flex flex-col md:min-w-60 w-full sm:max-w-100">
				<AdminLogo size="lg" />

				<p className="text-lg font-medium">Sign in to your account</p>
				<p className="-mt-2 text-sm font-sans">
					Enter your credentials to access the admin dashboard
				</p>

				<div className="flex flex-col gap-2 font-sans">
					<Label htmlFor="email">Email Addess</Label>
					<Input
						id="email"
						type="email"
						placeholder="admin@medssi.com"
						className="h-10 rounded-sm"
					/>
				</div>

				<div className="flex flex-col gap-2 font-sans">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						placeholder="●●●●●●●●"
						className="h-10 rounded-sm"
					/>
				</div>

				<Button size="lg" className="h-11 rounded-sm font-sans">
					Sign In
				</Button>

				<div className="w-full flex justify-start">
					<p className="text-muted-foreground">Forgot Password?</p>
				</div>
			</Card>
		</div>
	);
};

export default SignInScreen;
