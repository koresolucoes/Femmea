import type { ChecklistTemplateItem, Journey, JourneyStage, JourneyStageDefinition } from "@/types/journey";

export const JOURNEY_STAGES: JourneyStageDefinition[] = [
  {
    key: "planning",
    title: "Planejamento",
    shortDescription: "Prepare seu corpo e mente antes do ciclo",
    eyebrow: "Planejamento e preparo",
    intro: "Organize consultas, exames e sua rotina para entrar na jornada com mais previsibilidade.",
    highlights: ["Avaliação inicial", "Exames e consultas", "Rotina e bem-estar", "Organização de medicações"],
  },
  {
    key: "cycle_monitoring",
    title: "Acompanhamento do ciclo",
    shortDescription: "Monitore seu ciclo e concentre as informações importantes",
    eyebrow: "Acompanhamento do ciclo",
    intro: "Registre eventos do ciclo e acompanhe os próximos marcos definidos junto à sua equipe de saúde.",
    highlights: ["Calendário do ciclo", "Registro de sintomas", "Exames de acompanhamento", "Lembretes"],
  },
  {
    key: "insemination_day",
    title: "Dia da inseminação",
    shortDescription: "Tudo o que você precisa para chegar ao dia organizada",
    eyebrow: "Dia da inseminação",
    intro: "Centralize os detalhes do procedimento, documentos e orientações recebidas da sua clínica.",
    highlights: ["Horário do procedimento", "Documentos e exames", "Orientações da clínica", "Checklist do dia"],
  },
  {
    key: "post_procedure",
    title: "Após o procedimento",
    shortDescription: "Cuidados, sinais e orientações para o período de espera",
    eyebrow: "Após o procedimento",
    intro: "Acompanhe o período após o procedimento sem substituir as orientações da equipe médica responsável.",
    highlights: ["Cuidados registrados", "Sintomas", "Lembretes", "Próximos passos"],
  },
  {
    key: "pregnancy_test",
    title: "Teste de gravidez",
    shortDescription: "Acompanhe a data prevista e registre o resultado quando chegar o momento",
    eyebrow: "Teste de gravidez",
    intro: "Use a data orientada pela sua clínica e mantenha o resultado registrado na sua jornada.",
    highlights: ["Data prevista", "Lembrete", "Registro do resultado", "Próxima orientação"],
  },
];

export const CHECKLIST_TEMPLATE: ChecklistTemplateItem[] = [
  { key: "initial_consultation", label: "Consulta inicial realizada", stage: "planning", sortOrder: 10 },
  { key: "requested_exams", label: "Exames solicitados organizados", stage: "planning", sortOrder: 20 },
  { key: "medication_plan", label: "Plano de medicação registrado", stage: "planning", sortOrder: 30 },
  { key: "monitoring_scheduled", label: "Monitoramento agendado", stage: "cycle_monitoring", sortOrder: 40 },
  { key: "cycle_tracking", label: "Acompanhamento do ciclo atualizado", stage: "cycle_monitoring", sortOrder: 50 },
  { key: "procedure_documents", label: "Documentos do procedimento separados", stage: "insemination_day", sortOrder: 60 },
  { key: "procedure_day", label: "Dia da inseminação confirmado", stage: "insemination_day", sortOrder: 70 },
  { key: "post_care", label: "Cuidados pós-procedimento revisados", stage: "post_procedure", sortOrder: 80 },
  { key: "pregnancy_test", label: "Teste de gravidez programado", stage: "pregnancy_test", sortOrder: 90 },
];

export const CONTENT_LIBRARY = [
  { slug: "o-que-e-inseminacao", title: "O que é inseminação?", category: "Entenda sua jornada", icon: "document" },
  { slug: "como-funciona", title: "Como funciona o procedimento", category: "Passo a passo", icon: "sparkles" },
  { slug: "cuidados-antes", title: "Cuidados antes da inseminação", category: "Preparação", icon: "heart" },
  { slug: "alimentacao-e-rotina", title: "Alimentação e rotina", category: "Bem-estar", icon: "heart" },
  { slug: "sinais-e-sintomas", title: "Sinais do corpo e sintomas", category: "Acompanhamento", icon: "sparkles" },
  { slug: "duvidas-frequentes", title: "Dúvidas frequentes", category: "Informação", icon: "document" },
] as const;

export function getStageDefinition(stage: JourneyStage) {
  return JOURNEY_STAGES.find((item) => item.key === stage) ?? JOURNEY_STAGES[0];
}

export function stageIndex(stage: JourneyStage) {
  return Math.max(0, JOURNEY_STAGES.findIndex((item) => item.key === stage));
}

export function resolveJourneyStage(journey: Pick<Journey, "current_stage" | "procedure_date" | "pregnancy_test_date">, now = new Date()): JourneyStage {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (journey.pregnancy_test_date) {
    const testDate = new Date(`${journey.pregnancy_test_date}T00:00:00`);
    if (!Number.isNaN(testDate.getTime()) && today >= testDate) return "pregnancy_test";
  }

  if (journey.procedure_date) {
    const procedure = new Date(journey.procedure_date);
    if (!Number.isNaN(procedure.getTime())) {
      const procedureDay = new Date(procedure);
      procedureDay.setHours(0, 0, 0, 0);
      if (today.getTime() === procedureDay.getTime()) return "insemination_day";
      if (today > procedureDay) return "post_procedure";
      return "cycle_monitoring";
    }
  }

  return journey.current_stage || "planning";
}

export function formatJourneyDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return null;
  const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", options ?? { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function defaultPregnancyTestDate(procedureDate: string | null) {
  if (!procedureDate) return null;
  const date = new Date(procedureDate);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}
