import { CLIENT_ENV } from "@/config/client-env";
import { SERVER_ENV } from "@/config/server-env";
import { Clerk } from "@repo/utils/server";

export const serverUtilsRegistry = {
	clerk: new Clerk({
		secretKey: SERVER_ENV.CLERK_SECRET_KEY,
		publishableKey: CLIENT_ENV.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
	}),
};

Object.freeze(serverUtilsRegistry);
