import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { PlanningIllustration } from "@/components/illustrations/planning";
import { CycleIllustration } from "@/components/illustrations/cycle";
import { InseminationIllustration } from "@/components/illustrations/insemination";
import { PostProcedureIllustration } from "@/components/illustrations/post-procedure";
import { TestResultIllustration } from "@/components/illustrations/test-result";
import type { JourneyStoryStage } from "@/lib/journey-story";

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
}: {
  stage: JourneyStoryStage;
  procedureDate?: string | null;
  pregnancyTestDate?: string | null;
}) {
  const showDates = stage.key === "insemination_day" || stage.key === "post_procedure" || stage.key === "pregnancy_test";

  return (
    <div className="story-stage-panel-inner">
      <div className="story-illustration"><ChapterIllustration stage={stage} /></div>
      <p className="story-stage-story">{stage.story}</p>

      {showDates && (
        <div className="story-date-strip">
          <span><small>Procedimento</small><strong>{procedureDate || "Ainda não definido"}</strong></span>
          <span><small>Teste</small><strong>{pregnancyTestDate || "Ainda não definido"}</strong></span>
        </div>
      )}

      <div className="story-detail-list">
        {stage.details.map((detail, index) => (
          <div className="story-detail" key={detail.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><strong>{detail.title}</strong><small>{detail.text}</small></div>
            <ChevronRightIcon />
          </div>
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
