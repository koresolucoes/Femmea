"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { defaultPregnancyTestDate } from "@/lib/journey";
import { entryPointToState, stateToChapter, type JourneyEntryPoint } from "@/lib/journey-state";
import { createClient } from "@/lib/supabase/server";

const validEntryPoints = new Set<JourneyEntryPoint>(["learning","clinic_started","cycle_monitoring","procedure_scheduled","post_procedure","waiting_test"]);

export async function completeOnboarding(_state: ActionState, formData: FormData): Promise<ActionState> {
  const displayName = String(formData.get("displayName") || "").trim();
  const entryPointRaw = String(formData.get("entryPoint") || "learning") as JourneyEntryPoint;
  const entryPoint: JourneyEntryPoint = validEntryPoints.has(entryPointRaw) ? entryPointRaw : "learning";
  const hydrationEnabled = String(formData.get("hydrationEnabled") || "false") === "true";
  const goalValue = formData.get("waterGoal");
  const goal = goalValue ? Number(goalValue) : 2000;
  const cycleStartDate = String(formData.get("cycleStartDate") || "").trim() || null;
  const procedureDateValue = String(formData.get("procedureDate") || "").trim();
  const pregnancyTestDateValue = String(formData.get("pregnancyTestDate") || "").trim();

  if (displayName.length < 2) return { status: "error", message: "Informe seu nome." };
  if (!Number.isInteger(goal) || goal < 500 || goal > 5000) return { status: "error", message: "A meta de água deve ficar entre 500 e 5000 ml." };

  const procedureDate = procedureDateValue ? new Date(`${procedureDateValue}T12:00:00`).toISOString() : null;
  const pregnancyTestDate = pregnancyTestDateValue || (procedureDate ? defaultPregnancyTestDate(procedureDate) : null);
  const currentState = entryPointToState(entryPoint);
  const currentStage = stateToChapter(currentState);

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { status: "error", message: "Sua sessão expirou." };

  const { error: profileError } = await supabase.from("femmea_profiles").upsert({
    id: userId,
    display_name: displayName,
    daily_water_goal_ml: goal,
    hydration_enabled: hydrationEnabled,
    journey_entry_point: entryPoint,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  });
  if (profileError) return { status: "error", message: "Não foi possível salvar seu perfil." };

  const { data: existingJourney } = await supabase.from("femmea_insemination_journeys").select("id").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (!existingJourney) {
    let treatmentId: string | null = null;
    const { data: treatment } = await supabase.from("femmea_treatments").insert({ user_id: userId, title: "Minha jornada de inseminação", status: "active" }).select("id").single();
    treatmentId = treatment?.id ?? null;

    const { data: journey, error: journeyError } = await supabase.from("femmea_insemination_journeys").insert({
      user_id: userId,
      treatment_id: treatmentId,
      attempt_number: 1,
      current_stage: currentStage,
      current_state: currentState,
      status: "active",
      cycle_start_date: cycleStartDate,
      procedure_date: procedureDate,
      pregnancy_test_date: pregnancyTestDate,
    }).select("id").single();

    if (journeyError || !journey) return { status: "error", message: "Seu perfil foi salvo, mas a jornada não pôde ser criada." };

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
  }

  redirect("/");
}
