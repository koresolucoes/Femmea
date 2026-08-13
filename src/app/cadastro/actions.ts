"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";

export async function signup(_state: ActionState, formData: FormData): Promise<ActionState> {
  const displayName = String(formData.get("displayName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (displayName.length < 2) return { status: "error", message: "Informe seu nome." };
  if (!email.includes("@")) return { status: "error", message: "Informe um e-mail válido." };
  if (password.length < 8) return { status: "error", message: "Use uma senha com pelo menos 8 caracteres." };

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") || undefined;
  const siteUrl = getSiteUrl(origin);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, app: "femmea" },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (error) return { status: "error", message: error.message.includes("registered") ? "Este e-mail já possui uma conta." : "Não foi possível criar a conta." };

  if (data.session) redirect("/onboarding");

  return { status: "success", message: "Conta criada. Confirme o e-mail enviado para sua caixa de entrada." };
}
