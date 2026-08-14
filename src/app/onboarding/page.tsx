import { redirect } from "next/navigation";
import { SetupRequired } from "@/components/setup-required";
import { requireUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("femmea_profiles").select("display_name,onboarding_completed").eq("id", user.id).maybeSingle();
  if (profile?.onboarding_completed) redirect("/");

  return <main className="onboarding-page"><section className="onboarding-card onboarding-card-v2"><p className="auth-brand">Femmea</p><div className="step-pill">3 passos curtos</div><h1>Sua jornada começa onde você está</h1><p className="auth-subtitle">Conte apenas o necessário para o Femmea montar uma experiência útil desde o primeiro dia.</p><OnboardingForm initialName={profile?.display_name || ""} /></section></main>;
}
