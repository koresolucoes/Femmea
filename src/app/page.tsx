import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarIcon, ChevronRightIcon, HeartIcon, SettingsIcon, SparklesIcon } from "@/components/icons";
import { HydrationAdd } from "@/components/hydration-add";
import { MobileShell } from "@/components/mobile-shell";
import { SetupRequired } from "@/components/setup-required";
import { requireUser } from "@/lib/auth";
import { isoDateInTimeZone } from "@/lib/date";
import { JOURNEY_STATE_META, isJourneyState, stateForDates } from "@/lib/journey-state";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type TimelineItem = { title: string; at: string; kind: "reminder" | "event" };

function firstName(value: string | null | undefined) {
  return value?.trim().split(/\s+/)[0] || "você";
}

export default async function Home() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase.from("femmea_profiles").select("display_name,timezone,daily_water_goal_ml,hydration_enabled,onboarding_completed").eq("id", user.id).maybeSingle();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const { data: journey } = await supabase.from("femmea_insemination_journeys").select("id,current_stage,current_state,status,outcome,attempt_number,procedure_date,pregnancy_test_date").eq("user_id", user.id).in("status", ["active", "paused", "postponed"]).order("created_at", { ascending: false }).limit(1).maybeSingle();

  const timeZone = profile.timezone || "America/Sao_Paulo";
  const now = new Date();
  const nowIso = now.toISOString();
  const today = isoDateInTimeZone(now, timeZone);

  const [hydrationResponse, symptomResponse, observationResponse, reminderResponse, eventResponse] = await Promise.all([
    supabase.from("femmea_hydration_logs").select("amount_ml").eq("user_id", user.id).eq("consumed_on", today),
    supabase.from("femmea_symptom_logs").select("id").eq("user_id", user.id).eq("log_date", today).maybeSingle(),
    supabase.from("femmea_cycle_observations").select("id").eq("user_id", user.id).eq("observation_date", today).maybeSingle(),
    supabase.from("femmea_reminders").select("title,scheduled_for,event_id").eq("user_id", user.id).eq("enabled", true).gte("scheduled_for", nowIso).order("scheduled_for", { ascending: true }).limit(12),
    supabase.from("femmea_journey_events").select("title,starts_at,status").eq("user_id", user.id).eq("status", "scheduled").gte("starts_at", nowIso).order("starts_at", { ascending: true }).limit(12),
  ]);

  const hydrationTotal = (hydrationResponse.data ?? []).reduce((sum, item) => sum + item.amount_ml, 0);
  const hydrationGoal = profile.daily_water_goal_ml || 2000;
  const hydrationProgress = Math.min(100, Math.round((hydrationTotal / hydrationGoal) * 100));

  const reminders: TimelineItem[] = (reminderResponse.data ?? []).filter((item) => !item.event_id).map((item) => ({ title: item.title, at: item.scheduled_for, kind: "reminder" }));
  const events: TimelineItem[] = (eventResponse.data ?? []).map((item) => ({ title: item.title, at: item.starts_at, kind: "event" }));
  const upcoming = [...reminders, ...events].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const nextItem = upcoming[0] ?? null;
  const todayScheduled = upcoming.filter((item) => isoDateInTimeZone(new Date(item.at), timeZone) === today).slice(0, 3);

  const storedState = journey && isJourneyState(journey.current_state) ? journey.current_state : "preparation";
  const currentState = journey ? stateForDates({ currentState: storedState, procedureDate: journey.procedure_date, pregnancyTestDate: journey.pregnancy_test_date, outcome: journey.outcome }) : "preparation";
  const stateMeta = JOURNEY_STATE_META[currentState];

  const dateLabel = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short", timeZone }).format(now).replace(".", "");
  const formatMoment = (value: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone }).format(new Date(value)).replace(".", "");
  const formatTime = (value: string) => new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date(value));

  return <MobileShell active="today">
    <header className="today-header"><div className="today-header-copy"><div className="journey-brand">Femmea</div><p>Olá, {firstName(profile.display_name)}. O que importa para hoje está aqui.</p></div><Link href="/perfil" className="icon-btn" aria-label="Configurações"><SettingsIcon /></Link></header>
    <span className="today-date">{dateLabel}</span>

    <section className="today-journey-card"><span className="stage-kicker">Sua jornada · tentativa {journey?.attempt_number ?? 1}</span><h1>{stateMeta.label}</h1><p>{stateMeta.description}</p><div className="today-journey-meta">{journey?.procedure_date && <span>Procedimento {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone }).format(new Date(journey.procedure_date))}</span>}{journey?.pregnancy_test_date && <span>Teste {journey.pregnancy_test_date.split("-").reverse().join("/")}</span>}</div><Link href={`/inseminacao?stage=${stateMeta.chapter}`}>Continuar minha história <ChevronRightIcon /></Link></section>

    <section className="today-section"><div className="today-section-heading"><h2>Próximo passo</h2><Link href="/calendario">Ver calendário</Link></div>{nextItem ? <div className="today-next-card"><span className="today-next-icon"><CalendarIcon /></span><div><strong>{nextItem.title}</strong><small>{formatMoment(nextItem.at)}</small></div><b>próximo</b></div> : <div className="today-empty">Nenhum compromisso futuro cadastrado. Quando você adicionar consultas, exames ou lembretes, o próximo passo aparece aqui.</div>}</section>

    <section className="today-section"><div className="today-section-heading"><h2>Hoje</h2><Link href="/lembretes">Organizar</Link></div><div className="today-list">{todayScheduled.map((item) => <div className="today-task" key={`${item.kind}-${item.at}-${item.title}`}><span><CalendarIcon /></span><div><strong>{item.title}</strong><small>{item.kind === "event" ? "Evento da jornada" : "Lembrete"}</small></div><b>{formatTime(item.at)}</b></div>)}{!symptomResponse.data && <Link className="today-task" href="/sintomas/registrar"><span><HeartIcon /></span><div><strong>Como você está hoje?</strong><small>Registre sintomas e emocional</small></div><b>registrar</b></Link>}{(currentState === "cycle_monitoring" || currentState === "procedure_scheduled") && !observationResponse.data && <Link className="today-task" href="/ciclo/temperatura"><span><SparklesIcon /></span><div><strong>Acompanhar seu ciclo</strong><small>Adicione uma observação quando fizer sentido</small></div><b>abrir</b></Link>}{todayScheduled.length === 0 && symptomResponse.data && (currentState !== "cycle_monitoring" || observationResponse.data) && <div className="today-empty">Tudo organizado por aqui. Você pode continuar a jornada ou registrar algo quando quiser.</div>}</div></section>

    <section className="today-section today-register-card"><div><h2>Como você está agora?</h2><p>Um registro curto hoje pode virar um histórico útil amanhã.</p></div><Link href="/sintomas/registrar" aria-label="Registrar como estou"><HeartIcon /></Link></section>

    {profile.hydration_enabled !== false && <section className="today-section"><div className="today-section-heading"><h2>Hábitos</h2><span /></div><div className="today-habit-card"><div className="today-habit-top"><strong>Hidratação</strong><span>{hydrationTotal} / {hydrationGoal} ml</span></div><div className="today-habit-track"><span style={{ width: `${hydrationProgress}%` }} /></div></div><div className="today-hydration-actions"><HydrationAdd /></div></section>}
  </MobileShell>;
}
