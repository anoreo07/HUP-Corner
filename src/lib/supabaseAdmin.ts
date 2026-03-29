import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/env.mjs';

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

// Prevent accidental client-side import. This is a runtime guard.
if (typeof window !== 'undefined') {
	throw new Error('supabaseAdmin must only be imported from server-side code');
}

// Validate environment variables
if (!supabaseUrl) {
	throw new Error(
		'NEXT_PUBLIC_SUPABASE_URL is not configured. ' +
		'Please add it to your .env.local file.'
	);
}

if (!supabaseServiceRoleKey) {
	throw new Error(
		'SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
		'Please add it to your .env.local file. ' +
		'Get it from: Supabase Dashboard → Settings → API → Service Role Secret'
	);
}

// Do NOT create a service-role client at module import time. Export a factory
// so callers can explicitly obtain the service client after performing
// authentication/authorization checks.
export function getSupabaseAdmin(): SupabaseClient {
	return createClient(supabaseUrl, supabaseServiceRoleKey);
}