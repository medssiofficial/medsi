/**
 * Central rules for when Sentry should run. Keeps dev fast and avoids noise
 * from preview deployments unless you opt in.
 *
 * - `NODE_ENV === "production"` is always required.
 * - If `VERCEL_ENV` or `NEXT_PUBLIC_VERCEL_ENV` is set and non-empty, it must be
 *   `"production"` (excludes Preview / development on Vercel).
 * - `NEXT_PUBLIC_SENTRY_ENABLED === "false"` disables Sentry everywhere
 *   (emergency kill switch). Any other value (including unset) does not force
 *   Sentry on in non-production.
 */
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

/** Same eligibility as runtime; used by `withSentryNextConfig` at build time. */
export const isSentryBuildTimeEnabled = (): boolean =>
	isSentryDeploymentEligible();
