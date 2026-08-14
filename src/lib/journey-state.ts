import type { JourneyStage } from "@/types/journey";

export type JourneyState =
  | "preparation"
  | "cycle_monitoring"
  | "procedure_scheduled"
  | "procedure_day"
  | "waiting_period"
  | "test_due"
  | "result";

export type JourneyStatus = "active" | "paused" | "postponed" | "cancelled" | "completed";
export type JourneyOutcome = "positive" | "negative" | "inconclusive";

export const JOURNEY_STATE_META: Record<JourneyState, { label: string; description: string; chapter: JourneyStage }> = {
  preparation: {
    label: "Preparação",
    description: "Organize consultas, exames e os primeiros passos.",
    chapter: "planning",
  },
  cycle_monitoring: {
    label: "Acompanhando o ciclo",
    description: "Registre sinais, exames e informações do seu ciclo.",
    chapter: "cycle_monitoring",
  },
  procedure_scheduled: {
    label: "Inseminação marcada",
    description: "Seu procedimento está agendado. Agora é hora de organizar o grande dia.",
    chapter: "insemination_day",
  },
  procedure_day: {
    label: "Dia da inseminação",
    description: "Tenha horários, documentos e orientações à mão.",
    chapter: "insemination_day",
  },
  waiting_period: {
    label: "Tempo de espera",
    description: "Acompanhe seus dias com cuidado, sem precisar guardar tudo na memória.",
    chapter: "post_procedure",
  },
  test_due: {
    label: "Hora do teste",
    description: "A data chegou ou está próxima. Siga a orientação da sua equipe.",
    chapter: "pregnancy_test",
  },
  result: {
    label: "Resultado registrado",
    description: "Sua tentativa foi registrada e a próxima decisão pode ser feita com calma.",
    chapter: "pregnancy_test",
  },
};

export const ENTRY_POINT_TO_STATE = {
  learning: "preparation",
  clinic_started: "preparation",
  cycle_monitoring: "cycle_monitoring",
  procedure_scheduled: "procedure_scheduled",
  post_procedure: "waiting_period",
  waiting_test: "test_due",
} as const satisfies Record<string, JourneyState>;

export type JourneyEntryPoint = keyof typeof ENTRY_POINT_TO_STATE;

export function isJourneyState(value: unknown): value is JourneyState {
  return typeof value === "string" && value in JOURNEY_STATE_META;
}

export function stateToChapter(state: JourneyState): JourneyStage {
  return JOURNEY_STATE_META[state].chapter;
}

export function entryPointToState(entryPoint: JourneyEntryPoint): JourneyState {
  return ENTRY_POINT_TO_STATE[entryPoint];
}

export function stateForDates({
  currentState,
  procedureDate,
  pregnancyTestDate,
  outcome,
  now = new Date(),
}: {
  currentState: JourneyState;
  procedureDate?: string | null;
  pregnancyTestDate?: string | null;
  outcome?: JourneyOutcome | null;
  now?: Date;
}): JourneyState {
  if (outcome === "positive" || outcome === "negative") return "result";

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (pregnancyTestDate) {
    const test = new Date(`${pregnancyTestDate.slice(0, 10)}T00:00:00`);
    if (!Number.isNaN(test.getTime()) && today >= test) return "test_due";
  }

  if (procedureDate) {
    const procedure = new Date(procedureDate);
    if (!Number.isNaN(procedure.getTime())) {
      const day = new Date(procedure);
      day.setHours(0, 0, 0, 0);
      if (today.getTime() === day.getTime()) return "procedure_day";
      if (today > day) return "waiting_period";
      return "procedure_scheduled";
    }
  }

  return currentState;
}

export function stageForState(state: JourneyState) {
  return JOURNEY_STATE_META[state].chapter;
}

export function outcomeLabel(outcome: JourneyOutcome | null | undefined) {
  if (outcome === "positive") return "Positivo";
  if (outcome === "negative") return "Negativo";
  if (outcome === "inconclusive") return "Inconclusivo";
  return null;
}
