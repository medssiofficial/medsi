"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface Props {
	children: React.ReactNode;
}

export const QueryProvider = (props: Props) => {
	const { children } = props;

	const queryClient = new QueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
};
