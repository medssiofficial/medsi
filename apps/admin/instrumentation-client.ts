import { initSentryClient } from "@repo/sentry/client";
import { CLIENT_ENV } from "@/config/client-env";

initSentryClient(CLIENT_ENV.NEXT_PUBLIC_SENTRY_DSN ?? "");

export { onRouterTransitionStart } from "@repo/sentry/client";
