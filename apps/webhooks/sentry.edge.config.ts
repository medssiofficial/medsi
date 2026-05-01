import { initSentryEdge } from "@repo/sentry/edge";
import { SERVER_ENV } from "@/config/server-env";

initSentryEdge(SERVER_ENV.SENTRY_DSN ?? "");
