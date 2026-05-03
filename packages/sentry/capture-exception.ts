import * as Sentry from "@sentry/nextjs";
import { isSentryDeploymentEligible } from "./runtime-enabled";

export const captureExceptionIfEnabled = (error: unknown): void => {
	if (!isSentryDeploymentEligible()) return;
	Sentry.captureException(error);
};
