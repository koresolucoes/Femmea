import type { JourneyOutcome, JourneyState, JourneyStatus } from "@/lib/journey-state";

export type JourneyStage =
  | "planning"
  | "cycle_monitoring"
  | "insemination_day"
  | "post_procedure"
  | "pregnancy_test";

export type Journey = {
  id: string;
  user_id: string;
  current_stage: JourneyStage;
  current_state?: JourneyState;
  status?: JourneyStatus;
  outcome?: JourneyOutcome | null;
  treatment_id?: string | null;
  attempt_number?: number;
  cycle_start_date: string | null;
  procedure_date: string | null;
  pregnancy_test_date: string | null;
  outcome_recorded_at?: string | null;
  ended_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type JourneyStageDefinition = {
  key: JourneyStage;
  title: string;
  shortDescription: string;
  eyebrow: string;
  intro: string;
  highlights: string[];
};

export type ChecklistTemplateItem = {
  key: string;
  label: string;
  description?: string;
  stage: JourneyStage;
  sortOrder: number;
};
