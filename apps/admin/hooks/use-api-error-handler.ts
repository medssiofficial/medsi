"use client";

import { toast } from "sonner";

type ErrorHandlerFunc = (error: Error) => void;

export const useAPIErrorHandler = () => {
	const APIErrorHandler =
		(customHandler?: ErrorHandlerFunc) => (error: unknown) => {
			if (error instanceof Error) {
				if (customHandler) {
					customHandler(error);
					return;
				}

				toast.error(error.message);
				return;
			}

			toast.error("Some error occurred.");
		};

	return {
		APIErrorHandler,
	};
};
