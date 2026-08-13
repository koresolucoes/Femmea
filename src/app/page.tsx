import Link from "next/link";
import { redirect } from "next/navigation";
import { MobileShell } from "@/components/mobile-shell";
import { SettingsIcon, SparklesIcon } from "@/components/icons";
import { ProgressRing } from "@/components/progress-ring";
import { HydrationAdd } from "@/components/hydration-add";
import { SetupRequired } from "@/components/setup-required";
import { requireUser } from "@/lib/auth";
import { currentWeekDates, isoDateInTimeZone } from "@/lib/date";
import { getStageDefinition, resolveJourneyStage } from "@/lib/journey";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function Home() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("femmea_profiles")
    .select("display_name,timezone,daily_water_goal_ml,onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { data: journey } = await supabase
    .from("femmea_insemination_journeys")
    .select("id,current_stage,procedure_date,pregnancy_test_date")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const timeZone = profile.timezone || "America/Sao_Paulo";
  const goal = profile.daily_water_goal_ml || 2000;
  const weekDates = currentWeekDates(timeZone);
  const today = isoDateInTimeZone(new Date(), timeZone);

  const { data: hydration } = await supabase
    .from("femmea_hydration_logs")
    .select("amount_ml,consumed_on")
    .eq("user_id", user.id)
    .gte("consumed_on", weekDates[0])
    .lte("consumed_on", weekDates[6]);

  const totals = new Map<string, number>();
  hydration?.forEach((log) => totals.set(log.consumed_on, (totals.get(log.consumed_on) || 0) + log.amount_ml));
  const todayTotal = totals.get(today) || 0;
  const progress = Math.min(100, Math.round((todayTotal / goal) * 100));
  const journeyStage = journey ? getStageDefinition(resolveJourneyStage(journey as never)) : null;

  return (
    <MobileShell>
      <header className="brand-header">
        <div className="brand-ornament" aria-hidden />
        <div>
          <h1>Femmea</h1>
          {profile.display_name && <p className="hello-copy">Olá, {profile.display_name.split(" ")[0]}</p>}
        </div>
        <Link href="/perfil" className="icon-btn" aria-label="Configurações"><SettingsIcon /></Link>
      </header>

      <section className="section hydration">
        <p className="eyebrow">Meta diária de água</p>
        <h2>{todayTotal}/{goal}ml</h2>
        <ProgressRing value={progress} />
      </section>

      <section className="weekly-card">
        <p className="weekly-title">Estatísticas da semana:</p>
        <div className="week-grid">
          {weekDates.map((date, index) => {
            const percentage = Math.min(100, Math.round(((totals.get(date) || 0) / goal) * 100));
            return <div key={date} className={date === today ? "today" : ""}><span>{percentage}%</span><small>{dayLabels[index]}</small></div>;
          })}
        </div>
      </section>

      <HydrationAdd />

      <Link href="/inseminacao" className="journey-card">
        <span className="journey-badge"><SparklesIcon /></span>
        <span><strong>{journeyStage?.title ?? "Minha jornada"}</strong><small>{journeyStage?.shortDescription ?? "Acompanhar inseminação"}</small></span>
        <span aria-hidden>›</span>
      </Link>
    </MobileShell>
  );
}
