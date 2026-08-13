"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";
import { isoDateInTimeZone } from "@/lib/date";

export async function addHydration(_state: ActionState, formData: FormData): Promise<ActionState> {
  const amount = Number(formData.get("amount"));
  if (!Number.isInteger(amount) || amount < 50 || amount > 2000) {
    return { status: "error", message: "Informe uma quantidade entre 50 e 2000 ml." };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { status: "error", message: "Sua sessão expirou. Entre novamente." };

  const { data: profile } = await supabase
    .from("femmea_profiles")
    .select("timezone")
    .eq("id", userId)
    .maybeSingle();

  const timeZone = profile?.timezone || "America/Sao_Paulo";
  const consumedOn = isoDateInTimeZone(new Date(), timeZone);

  const { error } = await supabase.from("femmea_hydration_logs").insert({
    user_id: userId,
    amount_ml: amount,
    consumed_on: consumedOn,
  });

  if (error) return { status: "error", message: "Não foi possível registrar a água agora." };

  revalidatePath("/");
  return { status: "success", message: "Água registrada." };
}
