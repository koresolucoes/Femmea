"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarIcon, CheckIcon, HeartIcon, SparklesIcon } from "@/components/icons";
import { JOURNEY_STORY } from "@/lib/journey-story";
import type { JourneyStage } from "@/types/journey";
import { StoryStagePanel, type StoryCycleContext } from "./story-stage-panel";

const icons = {
  planning: CalendarIcon,
  cycle_monitoring: HeartIcon,
  insemination_day: SparklesIcon,
  post_procedure: HeartIcon,
  pregnancy_test: SparklesIcon,
} satisfies Record<JourneyStage, typeof CalendarIcon>;

export function JourneyTimeline({ initialStage, currentStage, procedureDate, pregnancyTestDate, cycleContext }: {
  initialStage: JourneyStage;
  currentStage: JourneyStage;
  procedureDate?: string | null;
  pregnancyTestDate?: string | null;
  cycleContext?: StoryCycleContext | null;
}) {
  const [openStage, setOpenStage] = useState<JourneyStage | null>(initialStage);
  const refs = useRef<Partial<Record<JourneyStage, HTMLElement | null>>>({});
  const currentIndex = JOURNEY_STORY.findIndex((stage) => stage.key === currentStage);

  useEffect(() => {
    if (!openStage) return;
    const id = window.setTimeout(() => refs.current[openStage]?.scrollIntoView({ behavior: "smooth", block: "center" }), 220);
    return () => window.clearTimeout(id);
  }, [openStage]);

  function selectStage(stage: JourneyStage) {
    setOpenStage((value) => value === stage ? null : stage);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "timeline");
    url.searchParams.set("stage", stage);
    window.history.replaceState({}, "", url);
  }

  return (
    <section className="story-timeline" aria-label="Etapas da jornada">
      {JOURNEY_STORY.map((stage, index) => {
        const Icon = icons[stage.key];
        const isOpen = openStage === stage.key;
        const isPast = index < currentIndex;
        const isCurrent = stage.key === currentStage;
        return (
          <article key={stage.key} ref={(node) => { refs.current[stage.key] = node; }} className={`story-stage ${isOpen ? "is-open" : ""} ${isCurrent ? "is-current" : ""}`}>
            {index < JOURNEY_STORY.length - 1 && <span className={`story-rail-line ${isPast ? "is-past" : ""}`} aria-hidden="true" />}
            <button className="story-stage-trigger" type="button" onClick={() => selectStage(stage.key)} aria-expanded={isOpen}>
              <span className={`story-node ${isPast ? "is-past" : ""} ${isCurrent ? "is-current" : ""}`}>{isPast ? <CheckIcon /> : <Icon />}</span>
              <span className="story-stage-copy"><small>{stage.chapter}</small><strong>{stage.title}</strong><span>{stage.shortDescription}</span></span>
              <span className="story-toggle" aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
            <div className="story-stage-expander" data-open={isOpen ? "true" : "false"}>
              <div><StoryStagePanel stage={stage} procedureDate={procedureDate} pregnancyTestDate={pregnancyTestDate} cycleContext={cycleContext} /></div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
