import { initSentryEdge } from "@repo/sentry/edge";
import { CLIENT_ENV } from "@/config/client-env";

initSentryEdge(CLIENT_ENV.NEXT_PUBLIC_SENTRY_DSN ?? "");
