import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarIcon, CheckIcon, ChevronRightIcon, HeartIcon, SparklesIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { CONTENT_LIBRARY, JOURNEY_STAGES, formatJourneyDate, resolveJourneyStage, stageIndex } from "@/lib/journey";
import { createClient } from "@/lib/supabase/server";
import type { Journey, JourneyStage } from "@/types/journey";
import { toggleChecklistItem, updateJourneyDates } from "./actions";

type Tab = "timeline" | "checklist" | "conteudos";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

const iconByStage = {
  planning: CalendarIcon,
  cycle_monitoring: HeartIcon,
  insemination_day: SparklesIcon,
  post_procedure: HeartIcon,
  pregnancy_test: SparklesIcon,
} satisfies Record<JourneyStage, typeof CalendarIcon>;

export default async function InseminacaoPage({ searchParams }: Props) {
  const user = await requireUser();
  const supabase = await createClient();
  const params = await searchParams;
  const tab: Tab = params.tab === "checklist" || params.tab === "conteudos" ? params.tab : "timeline";

  const { data: journeyData } = await supabase
    .from("femmea_insemination_journeys")
    .select("id,user_id,current_stage,cycle_start_date,procedure_date,pregnancy_test_date,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!journeyData) redirect("/onboarding");
  const journey = journeyData as Journey;
  const computedStage = resolveJourneyStage(journey);
  const currentIndex = stageIndex(computedStage);

  const { data: checklistData } = await supabase
    .from("femmea_journey_checklist_items")
    .select("id,item_key,label,stage,sort_order,completed,completed_at")
    .eq("journey_id", journey.id)
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });
  const checklist = checklistData ?? [];

  const completed = checklist.filter((item) => item.completed).length;
  const progress = checklist.length ? Math.round((completed / checklist.length) * 100) : 0;
  const procedureDate = journey.procedure_date?.slice(0, 10) ?? "";

  return (
    <MobileShell>
      <header className="journey-header">
        <Link href="/" className="back-button" aria-label="Voltar">‹</Link>
        <div className="journey-brand">Femmea</div>
        <span className="header-spacer" />
      </header>

      <h1 className="page-title">Inseminação</h1>

      <nav className="tabs" aria-label="Seções da jornada">
        <Link className={tab === "timeline" ? "active" : ""} href="/inseminacao?tab=timeline">Timeline</Link>
        <Link className={tab === "checklist" ? "active" : ""} href="/inseminacao?tab=checklist">Checklist</Link>
        <Link className={tab === "conteudos" ? "active" : ""} href="/inseminacao?tab=conteudos">Conteúdos</Link>
      </nav>

      {tab === "timeline" && (
        <>
          <section className="timeline-intro journey-status-intro">
            <span className="stage-kicker">Sua jornada passo a passo</span>
            <h2>{JOURNEY_STAGES[currentIndex].title}</h2>
            <p>{JOURNEY_STAGES[currentIndex].shortDescription}</p>
          </section>

          <section className="journey-date-card">
            <div>
              <small>Procedimento</small>
              <strong>{formatJourneyDate(journey.procedure_date) ?? "Ainda não definido"}</strong>
            </div>
            <div>
              <small>Teste previsto</small>
              <strong>{formatJourneyDate(journey.pregnancy_test_date) ?? "Será calculado"}</strong>
            </div>
          </section>

          <section className="timeline-list enhanced-timeline">
            {JOURNEY_STAGES.map((step, index) => {
              const Icon = iconByStage[step.key];
              const isCurrent = index === currentIndex;
              const isPast = index < currentIndex;
              return (
                <Link className={`timeline-step ${isCurrent ? "is-current" : ""}`} key={step.key} href={`/inseminacao/${step.key}`}>
                  <div className="timeline-rail">
                    <span className={`timeline-dot ${isCurrent ? "current" : ""} ${isPast ? "past" : ""}`}>
                      {isPast ? <CheckIcon /> : <Icon />}
                    </span>
                    {index < JOURNEY_STAGES.length - 1 && <span className={`timeline-line ${isPast ? "past" : ""}`} />}
                  </div>
                  <div className="timeline-copy">
                    <strong>{step.title}</strong>
                    <p>{step.shortDescription}</p>
                  </div>
                  <ChevronRightIcon className="timeline-chevron" />
                </Link>
              );
            })}
          </section>

          <details className="journey-settings-card">
            <summary>Ajustar datas da jornada</summary>
            <form action={updateJourneyDates} className="journey-date-form">
              <input type="hidden" name="journeyId" value={journey.id} />
              <label>
                <span>Data do procedimento</span>
                <input name="procedureDate" type="date" defaultValue={procedureDate} />
              </label>
              <label>
                <span>Data prevista do teste</span>
                <input name="pregnancyTestDate" type="date" defaultValue={journey.pregnancy_test_date ?? ""} />
              </label>
              <p>Se você deixar a data do teste vazia, o app sugere 14 dias após o procedimento. Confirme sempre as datas com a equipe responsável.</p>
              <button type="submit">Salvar datas</button>
            </form>
          </details>
        </>
      )}

      {tab === "checklist" && (
        <section className="checklist-screen">
          <div className="checklist-header-copy">
            <span className="stage-kicker">Checklist do ciclo</span>
            <h2>Marque o que já foi feito</h2>
            <p>Seu progresso fica salvo e acompanha a jornada.</p>
          </div>

          <div className="checklist-progress-card">
            <div className="checklist-progress-copy"><strong>{completed}/{checklist.length}</strong><span>itens concluídos</span></div>
            <div className="checklist-progress-track"><span style={{ width: `${progress}%` }} /></div>
            <b>{progress}%</b>
          </div>

          <div className="checklist-list">
            {checklist.map((item) => (
              <form action={toggleChecklistItem} key={item.id}>
                <input type="hidden" name="itemId" value={item.id} />
                <input type="hidden" name="completed" value={String(item.completed)} />
                <button className={`checklist-row ${item.completed ? "completed" : ""}`} type="submit">
                  <span className="check-box">{item.completed && <CheckIcon />}</span>
                  <span className="checklist-row-copy">
                    <strong>{item.label}</strong>
                    <small>{JOURNEY_STAGES.find((stage) => stage.key === item.stage)?.title}</small>
                  </span>
                </button>
              </form>
            ))}
          </div>

          <aside className="journey-tip"><SparklesIcon /><span><strong>Dica</strong> Manter tudo em dia ajuda você a visualizar sua jornada com mais tranquilidade.</span></aside>
        </section>
      )}

      {tab === "conteudos" && (
        <section className="content-screen">
          <div className="checklist-header-copy">
            <span className="stage-kicker">Conteúdos para você</span>
            <h2>Informação organizada por fase</h2>
            <p>Conteúdo educativo não substitui avaliação ou orientação profissional.</p>
          </div>

          <div className="content-list">
            {CONTENT_LIBRARY.map((content) => (
              <Link key={content.slug} className="content-row" href={`/inseminacao/conteudos/${content.slug}`}>
                <span className="content-icon">{content.icon === "heart" ? <HeartIcon /> : content.icon === "sparkles" ? <SparklesIcon /> : <CalendarIcon />}</span>
                <span><strong>{content.title}</strong><small>{content.category}</small></span>
                <ChevronRightIcon />
              </Link>
            ))}
          </div>
        </section>
      )}
    </MobileShell>
  );
}
