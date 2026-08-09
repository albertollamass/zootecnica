import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente para datos públicos (catálogo). Usa la anon key y RLS; sin cookies,
 * por lo que funciona también durante el prerender estático (build-time).
 */
export function createDataClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  if (!url || !key) {
    throw new Error("Faltan variables de entorno de Supabase (publishable key).");
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
