import { SUPABASE_ENV } from "@repo/env";
import { createClient } from "@supabase/supabase-js";

const getConfig = () => {
	const url = SUPABASE_ENV.NEXT_PUBLIC_SUPABASE_URL?.trim();
	const publishableKey =
		SUPABASE_ENV.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
	const secretKey = SUPABASE_ENV.SUPABASE_SECRET_KEY?.trim();
	const defaultBucket = SUPABASE_ENV.SUPABASE_STORAGE_BUCKET?.trim();

	return {
		url,
		publishableKey,
		secretKey,
		defaultBucket,
	};
};

let cachedServiceClient: ReturnType<typeof createClient> | null = null;
let cachedAnonClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseServiceClient = () => {
	const { url, secretKey } = getConfig();

	if (!url || !secretKey) {
		return null;
	}

	if (!cachedServiceClient) {
		cachedServiceClient = createClient(url, secretKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});
	}

	return cachedServiceClient;
};

export const getSupabaseAnonClient = () => {
	const { url, publishableKey } = getConfig();

	if (!url || !publishableKey) {
		return null;
	}

	if (!cachedAnonClient) {
		cachedAnonClient = createClient(url, publishableKey);
	}

	return cachedAnonClient;
};

export const getDefaultStorageBucket = () => {
	return getConfig().defaultBucket ?? null;
};
