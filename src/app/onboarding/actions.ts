"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(_state: ActionState, formData: FormData): Promise<ActionState> {
  const displayName = String(formData.get("displayName") || "").trim();
  const goal = Number(formData.get("waterGoal"));
  const cycleStartDate = String(formData.get("cycleStartDate") || "").trim() || null;

  if (displayName.length < 2) return { status: "error", message: "Informe seu nome." };
  if (!Number.isInteger(goal) || goal < 500 || goal > 5000) return { status: "error", message: "A meta deve ficar entre 500 e 5000 ml." };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { status: "error", message: "Sua sessão expirou." };

  const { error: profileError } = await supabase.from("femmea_profiles").upsert({
    id: userId,
    display_name: displayName,
    daily_water_goal_ml: goal,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  });

  if (profileError) return { status: "error", message: "Não foi possível salvar seu perfil." };

  const { data: existingJourney } = await supabase
    .from("femmea_insemination_journeys")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!existingJourney) {
    const { data: journey, error: journeyError } = await supabase
      .from("femmea_insemination_journeys")
      .insert({
        user_id: userId,
        current_stage: "planning",
        cycle_start_date: cycleStartDate,
      })
      .select("id")
      .single();

    if (journeyError || !journey) {
      return { status: "error", message: "Seu perfil foi salvo, mas a jornada não pôde ser criada." };
    }

    const checklist = [
      ["initial_consultation", "Consulta inicial realizada", "planning", 10],
      ["requested_exams", "Exames solicitados organizados", "planning", 20],
      ["medication_plan", "Plano de medicação registrado", "planning", 30],
      ["monitoring_scheduled", "Monitoramento agendado", "cycle_monitoring", 40],
      ["cycle_tracking", "Acompanhamento do ciclo atualizado", "cycle_monitoring", 50],
      ["procedure_documents", "Documentos do procedimento separados", "insemination_day", 60],
      ["procedure_day", "Dia da inseminação confirmado", "insemination_day", 70],
      ["post_care", "Cuidados pós-procedimento revisados", "post_procedure", 80],
      ["pregnancy_test", "Teste de gravidez programado", "pregnancy_test", 90],
    ].map(([item_key, label, stage, sort_order]) => ({
      user_id: userId,
      journey_id: journey.id,
      item_key,
      label,
      stage,
      sort_order,
    }));

    const { error: checklistError } = await supabase
      .from("femmea_journey_checklist_items")
      .insert(checklist);

    if (checklistError) {
      return { status: "error", message: "Sua jornada foi criada, mas o checklist não pôde ser preparado." };
    }
  }

  redirect("/");
}
