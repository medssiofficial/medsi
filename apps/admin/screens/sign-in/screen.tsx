"sue client";

import { DASHBOARD_URL, SIGN_IN_URL } from "@/config/client-constants";
import { SignIn } from "@clerk/nextjs";
import { AdminLogo } from "@repo/ui/components/brand/admin";

const SignInScreen = () => {
	return (
		<div className="bg-muted min-h-screen flex flex-col w-full font-heading">
			<div className="w-full flex pt-3 pb-3 px-4">
				<AdminLogo />
			</div>
			<div className="flex-1 flex flex-col items-center justify-center">
				<SignIn
					withSignUp={false}
					signInUrl={SIGN_IN_URL}
					fallbackRedirectUrl={DASHBOARD_URL}
				/>
			</div>
		</div>
	);
};

export default SignInScreen;
