import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string | undefined)?.trim();
const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const SUPABASE_CONFIG_ERROR =
  !envUrl || !envKey
    ? 'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file (see .env.example), then restart the dev server or rebuild for production.'
    : null;

export const supabaseUrl = envUrl ?? '';
export const supabaseAnonKey = envKey ?? '';

export const supabase: SupabaseClient = SUPABASE_CONFIG_ERROR
  ? (null as unknown as SupabaseClient)
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
