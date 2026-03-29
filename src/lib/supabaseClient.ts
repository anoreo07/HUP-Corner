import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL is not configured. ' +
    'Please add it to your .env.local file. ' +
    'Get your Supabase URL from: https://app.supabase.com'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured. ' +
    'Please add it to your .env.local file. ' +
    'Get your anon key from Supabase project settings.'
  );
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);