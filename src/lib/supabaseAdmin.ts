import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Prevent accidental client-side import. This is a runtime guard.
if (typeof window !== 'undefined') {
	throw new Error('supabaseAdmin must only be imported from server-side code');
}

// Do NOT create a service-role client at module import time. Export a factory
// so callers can explicitly obtain the service client after performing
// authentication/authorization checks.
export function getSupabaseAdmin(): SupabaseClient {
	return createClient(supabaseUrl, supabaseServiceRoleKey);
}