import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!url || !key) throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
  if (!client) client = createClient(url, key);
  return client;
}

export type District = { id: string; name: string };
export type City = { id: string; district_id: string; name: string };
export type TicketStatus = "new" | "acknowledged" | "in_progress" | "resolved" | "closed";