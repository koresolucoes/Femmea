"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(_state: ActionState, formData: FormData): Promise<ActionState> {
  const displayName = String(formData.get("displayName") || "").trim();
  const hydrationField = formData.get("hydrationEnabled");
  const waterGoal = Number(formData.get("waterGoal") || 2000);
  if (displayName.length < 2) return { status: "error", message: "Informe seu nome." };
  if (!Number.isInteger(waterGoal) || waterGoal < 500 || waterGoal > 5000) return { status: "error", message: "Meta de água inválida." };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { status: "error", message: "Sua sessão expirou." };

  const patch: Record<string, unknown> = { display_name: displayName, daily_water_goal_ml: waterGoal, updated_at: new Date().toISOString() };
  if (hydrationField !== null) patch.hydration_enabled = String(hydrationField) === "true";

  const { error } = await supabase.from("femmea_profiles").update(patch).eq("id", userId);
  if (error) return { status: "error", message: "Não foi possível salvar as alterações." };
  revalidatePath("/"); revalidatePath("/perfil");
  return { status: "success", message: "Perfil atualizado." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/entrar");
}
