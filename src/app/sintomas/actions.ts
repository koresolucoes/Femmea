"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedSymptoms = new Set([
  "colicas_leves",
  "inchaco",
  "sensibilidade_mamas",
  "sono",
  "cansaco",
  "nausea",
  "dor_cabeca",
  "dor_pelvica",
  "outros",
]);

export async function saveSymptoms(formData: FormData) {
  const logDate = String(formData.get("logDate") || "");
  const emotionalState = Number(formData.get("emotionalState"));
  const notes = String(formData.get("notes") || "").trim().slice(0, 1200);
  const symptoms = formData
    .getAll("symptoms")
    .map(String)
    .filter((value) => allowedSymptoms.has(value));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(logDate)) return;
  if (!Number.isInteger(emotionalState) || emotionalState < 1 || emotionalState > 5) return;

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect("/entrar");

  const { data: log, error: logError } = await supabase
    .from("femmea_symptom_logs")
    .upsert(
      {
        user_id: userId,
        log_date: logDate,
        emotional_state: emotionalState,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,log_date" },
    )
    .select("id")
    .single();

  if (logError || !log) return;

  await supabase.from("femmea_symptom_entries").delete().eq("symptom_log_id", log.id);

  if (symptoms.length) {
    await supabase.from("femmea_symptom_entries").insert(
      symptoms.map((symptom_type) => ({
        symptom_log_id: log.id,
        symptom_type,
      })),
    );
  }

  revalidatePath("/inseminacao/cycle_monitoring");
  revalidatePath("/sintomas/registrar");
  redirect("/sintomas/registrar?saved=1");
}
