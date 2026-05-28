import { createClient } from '@supabase/supabase-js';

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

const FALLBACK_URL = 'https://knrzvwptvhpfpvoobyas.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtucnp2d3B0dmhwZnB2b29ieWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4Mzg5MzgsImV4cCI6MjA5MjQxNDkzOH0.MaFfrv_pSrLcZlUt9A3O0LDgK8C_lE-8toimC4oDZzA';

export const supabaseUrl = envUrl && envUrl.length > 0 ? envUrl : FALLBACK_URL;
export const supabaseAnonKey = envKey && envKey.length > 0 ? envKey : FALLBACK_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
