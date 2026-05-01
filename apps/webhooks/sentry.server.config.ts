import { initSentryServer } from "@repo/sentry/server";
import { SERVER_ENV } from "@/config/server-env";

initSentryServer(SERVER_ENV.SENTRY_DSN ?? "");
