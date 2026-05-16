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

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Returns a Supabase client with service-role privileges.
 * Caches the client instance for reuse within the same process.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin;
  
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
  return supabaseAdmin;
}