"use server";

import { headers } from "next/headers";
import type { ActionState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/config";

export async function requestPasswordReset(_state: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email.includes("@")) return { status: "error", message: "Informe um e-mail válido." };

  const requestHeaders = await headers();
  const siteUrl = getSiteUrl(requestHeaders.get("origin") || undefined);
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/redefinir-senha`,
  });

  if (error) return { status: "error", message: "Não foi possível enviar o e-mail agora." };
  return { status: "success", message: "Se existir uma conta com esse e-mail, você receberá um link de recuperação." };
}
