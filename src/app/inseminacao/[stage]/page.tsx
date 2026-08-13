import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarIcon, CheckIcon, HeartIcon, SparklesIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { JOURNEY_STAGES, formatJourneyDate, getStageDefinition } from "@/lib/journey";
import { createClient } from "@/lib/supabase/server";
import type { JourneyStage } from "@/types/journey";
import { toggleChecklistItem } from "../actions";

type Props = { params: Promise<{ stage: string }> };

const validStages = new Set(JOURNEY_STAGES.map((stage) => stage.key));

export default async function JourneyStagePage({ params }: Props) {
  const { stage: rawStage } = await params;
  if (!validStages.has(rawStage as JourneyStage)) notFound();
  const stage = rawStage as JourneyStage;
  const definition = getStageDefinition(stage);

  const user = await requireUser();
  const supabase = await createClient();
  const { data: journey } = await supabase
    .from("femmea_insemination_journeys")
    .select("id,procedure_date,pregnancy_test_date")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!journey) redirect("/onboarding");
  const { data: checklist = [] } = await supabase
    .from("femmea_journey_checklist_items")
    .select("id,label,completed")
    .eq("journey_id", journey.id)
    .eq("user_id", user.id)
    .eq("stage", stage)
    .order("sort_order", { ascending: true });

  const StageIcon = stage === "planning" ? CalendarIcon : stage === "cycle_monitoring" || stage === "post_procedure" ? HeartIcon : SparklesIcon;

  return (
    <MobileShell>
      <header className="journey-header">
        <Link href="/inseminacao?tab=timeline" className="back-button" aria-label="Voltar">‹</Link>
        <div className="journey-brand">Femmea</div>
        <span className="header-spacer" />
      </header>

      <section className="stage-hero">
        <span className="stage-hero-icon"><StageIcon /></span>
        <span className="stage-kicker">{definition.eyebrow}</span>
        <h1>{definition.title}</h1>
        <p>{definition.intro}</p>
      </section>

      {(stage === "insemination_day" || stage === "post_procedure" || stage === "pregnancy_test") && (
        <section className="stage-date-banner">
          <span><small>Procedimento</small><strong>{formatJourneyDate(journey.procedure_date) ?? "Não definido"}</strong></span>
          <span><small>Teste</small><strong>{formatJourneyDate(journey.pregnancy_test_date) ?? "Não definido"}</strong></span>
        </section>
      )}

      <section className="stage-info-card">
        <h2>O que acompanhar nesta fase?</h2>
        <ul>
          {definition.highlights.map((item) => <li key={item}><span><CheckIcon /></span>{item}</li>)}
        </ul>
      </section>

      <section className="stage-checklist-block">
        <h2>Checklist da fase</h2>
        {checklist.length ? checklist.map((item) => (
          <form action={toggleChecklistItem} key={item.id}>
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="completed" value={String(item.completed)} />
            <button type="submit" className={`stage-check-row ${item.completed ? "completed" : ""}`}>
              <span>{item.completed && <CheckIcon />}</span>
              <strong>{item.label}</strong>
            </button>
          </form>
        )) : <p className="stage-empty">Nenhum item definido para esta fase.</p>}
      </section>

      <aside className="medical-note">
        <HeartIcon />
        <p><strong>Importante:</strong> o Femmea organiza informações pessoais e lembretes. Condutas, datas clínicas e sinais de alerta devem seguir a orientação da equipe de saúde responsável.</p>
      </aside>
    </MobileShell>
  );
}
