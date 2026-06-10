import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client. Uses the service role key, so it must only
 * be imported from API routes (never from client components).
 * Returns null when the env vars are not configured, so the app can run
 * without a database (ranking simply shows a setup notice).
 */
export function getDb(): SupabaseClient | null {
  // Accept both names so an existing NEXT_PUBLIC_ var also works
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface StudentRow {
  id: string;
  name: string;
  points: number;
  stars: number;
  missions: number;
  exercises: number;
  correct: number;
  streak: number;
  last_active: string;
}
