"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addDaysToIsoDate, zonedDateTimeToIso } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";

const allowedCategories = new Set(["ovarian_stimulation", "ovulation_induction", "progesterone_support", "other"]);
const allowedRoutes = new Set(["injection", "oral", "vaginal", "other"]);
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

async function auth() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/entrar");
  return { supabase, userId };
}

function inclusiveDayCount(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T12:00:00Z`);
  const end = new Date(`${endDate}T12:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function refreshMedicationViews() {
  revalidatePath("/");
  revalidatePath("/medicamentos");
  revalidatePath("/calendario");
  revalidatePath("/inseminacao");
}

export async function createMedication(formData: FormData) {
  const name = String(formData.get("name") || "").trim().slice(0, 100);
  const category = String(formData.get("category") || "other");
  const doseLabel = String(formData.get("doseLabel") || "").trim().slice(0, 60);
  const administrationRoute = String(formData.get("administrationRoute") || "other");
  const startDate = String(formData.get("startDate") || "");
  const endDate = String(formData.get("endDate") || "");
  const notes = String(formData.get("notes") || "").trim().slice(0, 500) || null;
  const times = Array.from(new Set(
    formData.getAll("times")
      .map((value) => String(value).trim())
      .filter((value) => timePattern.test(value)),
  )).sort();

  const dayCount = inclusiveDayCount(startDate, endDate);
  if (
    !name || !doseLabel || !allowedCategories.has(category) || !allowedRoutes.has(administrationRoute)
    || !isoDatePattern.test(startDate) || !isoDatePattern.test(endDate)
    || !dayCount || dayCount < 1 || dayCount > 120 || times.length < 1 || times.length > 4
  ) {
    redirect("/medicamentos?error=validation");
  }

  const { supabase, userId } = await auth();
  const [{ data: journey }, { data: profile }] = await Promise.all([
    supabase.from("femmea_insemination_journeys")
      .select("id,treatment_id")
      .eq("user_id", userId)
      .in("status", ["active", "paused", "postponed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("femmea_profiles").select("timezone").eq("id", userId).maybeSingle(),
  ]);

  if (!journey?.id) redirect("/onboarding");
  const timeZone = profile?.timezone || "America/Sao_Paulo";
  let treatmentId = journey.treatment_id as string | null;

  if (!treatmentId) {
    const { data: treatment, error: treatmentError } = await supabase.from("femmea_treatments")
      .insert({ user_id: userId, title: "Minha jornada de inseminação", status: "active" })
      .select("id")
      .single();
    if (treatmentError || !treatment?.id) redirect("/medicamentos?error=save");
    treatmentId = treatment.id;
    await supabase.from("femmea_insemination_journeys")
      .update({ treatment_id: treatmentId, updated_at: new Date().toISOString() })
      .eq("id", journey.id)
      .eq("user_id", userId);
  }

  const { data: medication, error: medicationError } = await supabase.from("femmea_treatment_medications")
    .insert({
      user_id: userId,
      treatment_id: treatmentId,
      journey_id: journey.id,
      name,
      category,
      dose_label: doseLabel,
      administration_route: administrationRoute,
      start_date: startDate,
      end_date: endDate,
      notes,
      active: true,
    })
    .select("id")
    .single();

  if (medicationError || !medication?.id) redirect("/medicamentos?error=save");

  const { data: schedules, error: schedulesError } = await supabase.from("femmea_medication_schedules")
    .insert(times.map((time) => ({ user_id: userId, medication_id: medication.id, local_time: `${time}:00` })))
    .select("id,local_time");

  if (schedulesError || !schedules?.length) {
    await supabase.from("femmea_treatment_medications").delete().eq("id", medication.id).eq("user_id", userId);
    redirect("/medicamentos?error=save");
  }

  const occurrences: Array<{
    user_id: string;
    medication_id: string;
    schedule_id: string;
    scheduled_for: string;
    status: "pending";
  }> = [];

  for (let dayOffset = 0; dayOffset < dayCount; dayOffset += 1) {
    const date = addDaysToIsoDate(startDate, dayOffset);
    for (const schedule of schedules) {
      const time = String(schedule.local_time).slice(0, 5);
      const scheduledFor = zonedDateTimeToIso(date, time, timeZone);
      if (!scheduledFor) continue;
      occurrences.push({
        user_id: userId,
        medication_id: medication.id,
        schedule_id: schedule.id,
        scheduled_for: scheduledFor,
        status: "pending",
      });
    }
  }

  if (!occurrences.length) {
    await supabase.from("femmea_treatment_medications").delete().eq("id", medication.id).eq("user_id", userId);
    redirect("/medicamentos?error=save");
  }

  const { error: occurrencesError } = await supabase.from("femmea_medication_dose_occurrences").insert(occurrences);
  if (occurrencesError) {
    await supabase.from("femmea_treatment_medications").delete().eq("id", medication.id).eq("user_id", userId);
    redirect("/medicamentos?error=save");
  }

  refreshMedicationViews();
  redirect("/medicamentos?created=1");
}

export async function completeDose(formData: FormData) {
  const doseId = String(formData.get("doseId") || "");
  if (!doseId) return;
  const { supabase, userId } = await auth();
  const now = new Date().toISOString();
  await supabase.from("femmea_medication_dose_occurrences")
    .update({ status: "completed", completed_at: now, updated_at: now })
    .eq("id", doseId)
    .eq("user_id", userId);
  refreshMedicationViews();
}

export async function reopenDose(formData: FormData) {
  const doseId = String(formData.get("doseId") || "");
  if (!doseId) return;
  const { supabase, userId } = await auth();
  await supabase.from("femmea_medication_dose_occurrences")
    .update({ status: "pending", completed_at: null, updated_at: new Date().toISOString() })
    .eq("id", doseId)
    .eq("user_id", userId);
  refreshMedicationViews();
}
