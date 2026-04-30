import { initSentryServer } from "@repo/sentry/server";
import { CLIENT_ENV } from "@/config/client-env";

initSentryServer(CLIENT_ENV.NEXT_PUBLIC_SENTRY_DSN ?? "");
