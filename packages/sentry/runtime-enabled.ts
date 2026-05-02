const isExplicitlyDisabled = () =>
	process.env.NEXT_PUBLIC_SENTRY_ENABLED === "false";

const vercelTier = (): string | undefined => {
	const v =
		process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? "";
	return v === "" ? undefined : v;
};

export const isSentryDeploymentEligible = (): boolean => {
	if (isExplicitlyDisabled()) return false;
	if (process.env.NODE_ENV !== "production") return false;
	const tier = vercelTier();
	if (tier !== undefined && tier !== "production") return false;
	return true;
};

export const isSentryRuntimeInitEnabled = (dsn: string | undefined): boolean =>
	isSentryDeploymentEligible() && Boolean(dsn?.trim());

export const isSentryBuildTimeEnabled = (): boolean =>
	isSentryDeploymentEligible();
