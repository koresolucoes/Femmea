"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { defaultPregnancyTestDate } from "@/lib/journey";
import { isJourneyState, stateForDates, stateToChapter, type JourneyOutcome } from "@/lib/journey-state";
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
  await supabase.from("femmea_journey_checklist_items").update({ completed: !completed, completed_at: !completed ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", itemId).eq("user_id", userId);
  revalidatePath("/"); revalidatePath("/inseminacao"); revalidatePath("/calendario");
}

export async function updateJourneyDates(formData: FormData) {
  const journeyId = String(formData.get("journeyId") || "");
  const procedureDateValue = String(formData.get("procedureDate") || "").trim();
  const pregnancyTestDateValue = String(formData.get("pregnancyTestDate") || "").trim();
  if (!journeyId) return;

  const procedureDate = procedureDateValue ? new Date(`${procedureDateValue}T12:00:00`).toISOString() : null;
  const pregnancyTestDate = pregnancyTestDateValue || defaultPregnancyTestDate(procedureDate);
  if (procedureDate && pregnancyTestDate && new Date(`${pregnancyTestDate}T12:00:00`) < new Date(procedureDate)) return;

  const { supabase, userId } = await getUserId();
  if (!userId) redirect("/entrar");
  const { data: journey } = await supabase.from("femmea_insemination_journeys").select("current_state,outcome").eq("id", journeyId).eq("user_id", userId).maybeSingle();
  const storedState = isJourneyState(journey?.current_state) ? journey.current_state : "preparation";
  const currentState = stateForDates({ currentState: storedState, procedureDate, pregnancyTestDate, outcome: journey?.outcome });

  await supabase.from("femmea_insemination_journeys").update({ procedure_date: procedureDate, pregnancy_test_date: pregnancyTestDate, current_state: currentState, current_stage: stateToChapter(currentState), updated_at: new Date().toISOString() }).eq("id", journeyId).eq("user_id", userId);
  revalidatePath("/"); revalidatePath("/inseminacao"); revalidatePath("/calendario");
}

export async function setJourneyStage(formData: FormData) {
  const journeyId = String(formData.get("journeyId") || "");
  const stage = String(formData.get("stage") || "") as JourneyStage;
  const valid: JourneyStage[] = ["planning", "cycle_monitoring", "insemination_day", "post_procedure", "pregnancy_test"];
  if (!journeyId || !valid.includes(stage)) return;
  const { supabase, userId } = await getUserId();
  if (!userId) redirect("/entrar");
  await supabase.from("femmea_insemination_journeys").update({ current_stage: stage, updated_at: new Date().toISOString() }).eq("id", journeyId).eq("user_id", userId);
  revalidatePath("/"); revalidatePath("/inseminacao");
}

export async function recordJourneyOutcome(formData: FormData) {
  const journeyId = String(formData.get("journeyId") || "");
  const outcome = String(formData.get("outcome") || "") as JourneyOutcome;
  if (!journeyId || !["positive", "negative", "inconclusive"].includes(outcome)) return;
  const { supabase, userId } = await getUserId();
  if (!userId) redirect("/entrar");
  const finalOutcome = outcome === "positive" || outcome === "negative";
  const now = new Date().toISOString();
  await supabase.from("femmea_insemination_journeys").update({ outcome, outcome_recorded_at: now, current_state: finalOutcome ? "result" : "test_due", current_stage: "pregnancy_test", status: finalOutcome ? "completed" : "active", ended_at: finalOutcome ? now : null, updated_at: now }).eq("id", journeyId).eq("user_id", userId);
  revalidatePath("/"); revalidatePath("/inseminacao");
  redirect("/inseminacao?tab=timeline&stage=pregnancy_test");
}

export async function startNewAttempt(formData: FormData) {
  const previousJourneyId = String(formData.get("journeyId") || "");
  if (!previousJourneyId) return;
  const { supabase, userId } = await getUserId();
  if (!userId) redirect("/entrar");
  const { data: previous } = await supabase.from("femmea_insemination_journeys").select("treatment_id,attempt_number").eq("id", previousJourneyId).eq("user_id", userId).maybeSingle();
  if (!previous) return;
  let treatmentId = previous.treatment_id as string | null;
  if (!treatmentId) {
    const { data: treatment } = await supabase.from("femmea_treatments").insert({ user_id: userId, title: "Minha jornada de inseminação", status: "active" }).select("id").single();
    treatmentId = treatment?.id ?? null;
  }
  const { data: journey } = await supabase.from("femmea_insemination_journeys").insert({ user_id: userId, treatment_id: treatmentId, attempt_number: (previous.attempt_number ?? 1) + 1, current_stage: "planning", current_state: "preparation", status: "active" }).select("id").single();
  if (!journey) return;
  const checklist = [
    ["initial_consultation", "Consulta inicial realizada", "planning", 10],
    ["requested_exams", "Exames organizados", "planning", 20],
    ["medication_plan", "Orientações e medicamentos registrados", "planning", 30],
    ["monitoring_scheduled", "Monitoramento agendado", "cycle_monitoring", 40],
    ["cycle_tracking", "Acompanhamento do ciclo atualizado", "cycle_monitoring", 50],
    ["procedure_documents", "Documentos e exames separados", "insemination_day", 60],
    ["procedure_day", "Horário do procedimento confirmado", "insemination_day", 70],
    ["post_care", "Cuidados recebidos revisados", "post_procedure", 80],
    ["pregnancy_test", "Teste programado", "pregnancy_test", 90],
  ].map(([item_key,label,stage,sort_order]) => ({ user_id:userId, journey_id:journey.id, item_key, label, stage, sort_order }));
  await supabase.from("femmea_journey_checklist_items").insert(checklist);
  revalidatePath("/"); revalidatePath("/inseminacao"); revalidatePath("/calendario");
  redirect("/inseminacao?tab=timeline&stage=planning");
}
