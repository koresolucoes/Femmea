"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveWellbeing(formData: FormData) {
  const logDate = String(formData.get("logDate") || "");
  const emotionalState = Number(formData.get("emotionalState"));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(logDate)) return;
  if (!Number.isInteger(emotionalState) || emotionalState < 1 || emotionalState > 5) return;

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/entrar");

  const { error } = await supabase
    .from("femmea_symptom_logs")
    .upsert(
      {
        user_id: userId,
        log_date: logDate,
        emotional_state: emotionalState,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,log_date" },
    );

  if (error) return;

  revalidatePath("/");
  revalidatePath("/registrar");
  revalidatePath("/sintomas/registrar");
  revalidatePath("/inseminacao/cycle_monitoring");
  redirect("/registrar?saved=wellbeing");
}
