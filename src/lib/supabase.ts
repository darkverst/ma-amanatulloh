import { createClient } from '@supabase/supabase-js';

function normalizeEnvValue(raw?: string): string {
  if (!raw) return '';
  return raw.trim().replace(/^['"`\s]+|['"`\s]+$/g, '');
}

export const supabaseUrl = normalizeEnvValue(
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_ma_SUPABASE_URL ||
  import.meta.env.ma_SUPABASE_URL
);

export const supabaseAnonKey = normalizeEnvValue(
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_ma_SUPABASE_ANON_KEY ||
  import.meta.env.ma_SUPABASE_ANON_KEY ||
  import.meta.env.ma_SUPABASE_PUBLISHABLE_KEY
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
