"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(_state: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") || "");
  if (password.length < 8) return { status: "error", message: "Use uma senha com pelo menos 8 caracteres." };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) return { status: "error", message: "O link expirou. Solicite uma nova recuperação." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: "error", message: "Não foi possível atualizar sua senha." };
  redirect("/");
}
