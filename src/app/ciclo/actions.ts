"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const validOvulationResults = new Set(["negative", "positive", "peak"]);
const validMucus = new Set(["dry", "sticky", "creamy", "watery", "egg_white", "other"]);

async function auth() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/entrar");
  return { supabase, userId };
}

export async function saveBasalTemperature(formData: FormData) {
  const observationDate = String(formData.get("observationDate") || "");
  const temperature = Number(String(formData.get("temperature") || "").replace(",", "."));
  const notes = String(formData.get("notes") || "").trim().slice(0, 500);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(observationDate)) return;
  if (!Number.isFinite(temperature) || temperature < 34 || temperature > 43) return;

  const { supabase, userId } = await auth();
  await supabase.from("femmea_cycle_observations").upsert(
    {
      user_id: userId,
      observation_date: observationDate,
      basal_temperature_c: temperature,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,observation_date" },
  );

  revalidatePath("/ciclo/temperatura");
  revalidatePath("/inseminacao/cycle_monitoring");
  redirect("/ciclo/temperatura?saved=1");
}

export async function saveOvulationTest(formData: FormData) {
  const observationDate = String(formData.get("observationDate") || "");
  const result = String(formData.get("result") || "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(observationDate) || !validOvulationResults.has(result)) return;

  const { supabase, userId } = await auth();
  await supabase.from("femmea_cycle_observations").upsert(
    {
      user_id: userId,
      observation_date: observationDate,
      ovulation_test_result: result,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,observation_date" },
  );

  revalidatePath("/ciclo/teste-ovulacao");
  revalidatePath("/inseminacao/cycle_monitoring");
  redirect("/ciclo/teste-ovulacao?saved=1");
}

export async function saveCervicalMucus(formData: FormData) {
  const observationDate = String(formData.get("observationDate") || "");
  const value = String(formData.get("value") || "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(observationDate) || !validMucus.has(value)) return;

  const { supabase, userId } = await auth();
  await supabase.from("femmea_cycle_observations").upsert(
    {
      user_id: userId,
      observation_date: observationDate,
      cervical_mucus: value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,observation_date" },
  );

  revalidatePath("/ciclo/corrimento");
  revalidatePath("/inseminacao/cycle_monitoring");
  redirect("/ciclo/corrimento?saved=1");
}
