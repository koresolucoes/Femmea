import Link from "next/link";
import { ChevronRightIcon, HeartIcon } from "@/components/icons";
import type { JourneyStoryStage } from "@/lib/journey-story";

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
      <div className={`story-scene story-scene-${stage.key}`} aria-hidden="true">
        <span className="story-orbit story-orbit-a" />
        <span className="story-orbit story-orbit-b" />
        <span className="story-figure story-figure-a" />
        <span className="story-figure story-figure-b" />
        <span className="story-symbol"><HeartIcon /></span>
      </div>

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
