import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente administrativo (server-side). Usa la secret key, que evita RLS y
 * permite ver productos inactivos y subir imágenes. SOLO Server Components /
 * Server Actions, nunca exponer al cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SECRET_KEY!;

  if (!url || !key) {
    throw new Error("Faltan variables de entorno de Supabase (secret key).");
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
