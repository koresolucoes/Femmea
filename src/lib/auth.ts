import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function getAuthClaims() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return data.claims;
}

export async function requireUser() {
  const claims = await getAuthClaims();
  if (!claims?.sub) redirect("/entrar");
  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
  };
}
