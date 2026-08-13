"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = new Set(["medication", "supplement", "appointment", "cycle", "pregnancy_test", "custom"]);

async function auth() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/entrar");
  return { supabase, userId };
}

export async function toggleReminder(formData: FormData) {
  const reminderId = String(formData.get("reminderId") || "");
  const enabled = String(formData.get("enabled") || "") === "true";
  if (!reminderId) return;

  const { supabase, userId } = await auth();
  await supabase
    .from("femmea_reminders")
    .update({ enabled: !enabled, updated_at: new Date().toISOString() })
    .eq("id", reminderId)
    .eq("user_id", userId);

  revalidatePath("/lembretes");
  revalidatePath("/calendario");
}

export async function createReminder(formData: FormData) {
  const title = String(formData.get("title") || "").trim().slice(0, 100);
  const type = String(formData.get("type") || "custom");
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "09:00");

  if (!title || !allowedTypes.has(type)) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return;

  const scheduled = new Date(`${date}T${time}:00`);
  if (Number.isNaN(scheduled.getTime())) return;

  const { supabase, userId } = await auth();
  await supabase.from("femmea_reminders").insert({
    user_id: userId,
    title,
    reminder_type: type,
    scheduled_for: scheduled.toISOString(),
    enabled: true,
  });

  revalidatePath("/lembretes");
  revalidatePath("/calendario");
  redirect("/lembretes?created=1");
}

export async function activatePregnancyTestReminder(formData: FormData) {
  const date = String(formData.get("date") || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

  const { supabase, userId } = await auth();
  const { data: existing } = await supabase
    .from("femmea_reminders")
    .select("id")
    .eq("user_id", userId)
    .eq("reminder_type", "pregnancy_test")
    .gte("scheduled_for", `${date}T00:00:00`)
    .lt("scheduled_for", `${date}T23:59:59`)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from("femmea_reminders")
      .update({ enabled: true, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .eq("user_id", userId);
  } else {
    await supabase.from("femmea_reminders").insert({
      user_id: userId,
      title: "Teste de gravidez",
      reminder_type: "pregnancy_test",
      scheduled_for: new Date(`${date}T09:00:00`).toISOString(),
      enabled: true,
    });
  }

  revalidatePath("/lembretes");
  revalidatePath("/calendario");
  revalidatePath("/inseminacao/pregnancy_test");
  redirect("/inseminacao/pregnancy_test?reminder=1");
}
