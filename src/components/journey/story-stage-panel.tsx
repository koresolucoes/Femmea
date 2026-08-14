import Link from "next/link";
import { PlanningIllustration } from "@/components/illustrations/planning";
import { CycleIllustration } from "@/components/illustrations/cycle";
import { InseminationIllustration } from "@/components/illustrations/insemination";
import { PostProcedureIllustration } from "@/components/illustrations/post-procedure";
import { TestResultIllustration } from "@/components/illustrations/test-result";
import type { JourneyStoryStage } from "@/lib/journey-story";

export type StoryCycleContext = {
  label: string;
  dayLabel: string;
  note: string;
};

function ChapterIllustration({ stage }: { stage: JourneyStoryStage }) {
  if (stage.illustration === "planning") return <PlanningIllustration />;
  if (stage.illustration === "cycle") return <CycleIllustration />;
  if (stage.illustration === "insemination") return <InseminationIllustration />;
  if (stage.illustration === "post") return <PostProcedureIllustration />;
  return <TestResultIllustration />;
}

export function StoryStagePanel({
  stage,
  procedureDate,
  pregnancyTestDate,
  cycleContext,
}: {
  stage: JourneyStoryStage;
  procedureDate?: string | null;
  pregnancyTestDate?: string | null;
  cycleContext?: StoryCycleContext | null;
}) {
  const showDates = stage.key === "insemination_day" || stage.key === "post_procedure" || stage.key === "pregnancy_test";

  return (
    <div className="story-stage-panel-inner">
      <div className="story-illustration"><ChapterIllustration stage={stage} /></div>
      <p className="story-stage-story">{stage.story}</p>

      {stage.key === "cycle_monitoring" && cycleContext && (
        <section className="story-context-card">
          <small>Seu ciclo agora</small>
          <strong>{cycleContext.label}</strong>
          <p>{cycleContext.dayLabel}. {cycleContext.note}</p>
        </section>
      )}

      {showDates && (
        <div className="story-date-strip">
          <span><small>Procedimento</small><strong>{procedureDate || "Ainda não definido"}</strong></span>
          <span><small>Teste</small><strong>{pregnancyTestDate || "Ainda não definido"}</strong></span>
        </div>
      )}

      <div className="story-guidance" aria-label={`Orientações de ${stage.title}`}>
        {stage.details.map((detail, index) => (
          <details key={detail.title} open={index === 0}>
            <summary>
              <span className="story-guidance-index">{String(index + 1).padStart(2, "0")}</span>
              <span><strong>{detail.title}</strong><small>Toque para entender esta parte da etapa</small></span>
              <span className="story-guidance-chevron" aria-hidden="true">+</span>
            </summary>
            <div className="story-guidance-body">{detail.text}</div>
          </details>
        ))}
      </div>

      {!!stage.actions.length && (
        <div className="story-actions">
          {stage.actions.map((action) => (
            <Link key={action.label} className={`story-action story-action-${action.tone ?? "soft"}`} href={action.href}>{action.label}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
