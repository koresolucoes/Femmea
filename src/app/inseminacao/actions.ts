"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultPregnancyTestDate, resolveJourneyStage } from "@/lib/journey";
import { createClient } from "@/lib/supabase/server";
import type { JourneyStage } from "@/types/journey";

async function getUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims?.sub ?? null };
}

export async function toggleChecklistItem(formData: FormData) {
  const itemId = String(formData.get("itemId") || "");
  const completed = String(formData.get("completed") || "") === "true";
  if (!itemId) return;

  const { supabase, userId } = await getUserId();
  if (!userId) redirect("/entrar");

  await supabase
    .from("femmea_journey_checklist_items")
    .update({ completed: !completed, completed_at: !completed ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("user_id", userId);

  revalidatePath("/inseminacao");
  revalidatePath("/calendario");
}

export async function updateJourneyDates(formData: FormData) {
  const journeyId = String(formData.get("journeyId") || "");
  const procedureDateValue = String(formData.get("procedureDate") || "").trim();
  const pregnancyTestDateValue = String(formData.get("pregnancyTestDate") || "").trim();
  if (!journeyId) return;

  const procedureDate = procedureDateValue ? new Date(`${procedureDateValue}T12:00:00`).toISOString() : null;
  const pregnancyTestDate = pregnancyTestDateValue || defaultPregnancyTestDate(procedureDate);

  if (procedureDate && pregnancyTestDate) {
    const procedureDay = new Date(procedureDate);
    const testDay = new Date(`${pregnancyTestDate}T12:00:00`);
    if (testDay < procedureDay) return;
  }

  const { supabase, userId } = await getUserId();
  if (!userId) redirect("/entrar");

  const stage = resolveJourneyStage({
    current_stage: "planning",
    procedure_date: procedureDate,
    pregnancy_test_date: pregnancyTestDate,
  });

  await supabase
    .from("femmea_insemination_journeys")
    .update({
      procedure_date: procedureDate,
      pregnancy_test_date: pregnancyTestDate,
      current_stage: stage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", journeyId)
    .eq("user_id", userId);

  revalidatePath("/");
  revalidatePath("/inseminacao");
  revalidatePath("/calendario");
}

export async function setJourneyStage(formData: FormData) {
  const journeyId = String(formData.get("journeyId") || "");
  const stage = String(formData.get("stage") || "") as JourneyStage;
  const valid: JourneyStage[] = ["planning", "cycle_monitoring", "insemination_day", "post_procedure", "pregnancy_test"];
  if (!journeyId || !valid.includes(stage)) return;

  const { supabase, userId } = await getUserId();
  if (!userId) redirect("/entrar");

  await supabase
    .from("femmea_insemination_journeys")
    .update({ current_stage: stage, updated_at: new Date().toISOString() })
    .eq("id", journeyId)
    .eq("user_id", userId);

  revalidatePath("/");
  revalidatePath("/inseminacao");
}
