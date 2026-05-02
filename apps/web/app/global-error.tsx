"use client";

import { captureExceptionIfEnabled } from "@repo/sentry/capture-exception";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
	error,
}: {
	error: Error & { digest?: string };
}) {
	useEffect(() => {
		captureExceptionIfEnabled(error);
	}, [error]);

	return (
		<html lang="en">
			<body>
				<NextError statusCode={0} />
			</body>
		</html>
	);
}
