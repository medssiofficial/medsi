"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";

interface Props extends React.ComponentProps<typeof ClerkProvider> {
	children: React.ReactNode;
	publishableKey: string;
}

const AuthProvider = (props: Props) => {
	const { children, publishableKey, ...rest } = props;

	return (
		<ClerkProvider
			publishableKey={publishableKey}
			appearance={{
				theme: shadcn,
			}}
			{...rest}
		>
			{children}
		</ClerkProvider>
	);
};

export default AuthProvider;
