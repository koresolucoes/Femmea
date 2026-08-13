import type { JourneyStage } from "@/types/journey";

export type JourneyIllustrationName =
  | "planning"
  | "cycle"
  | "insemination"
  | "post"
  | "test";

export type JourneyStoryAction = {
  label: string;
  href: string;
  tone?: "primary" | "soft";
};

export type JourneyStoryStage = {
  key: JourneyStage;
  chapter: string;
  title: string;
  shortDescription: string;
  story: string;
  illustration: JourneyIllustrationName;
  details: { title: string; text: string }[];
  actions: JourneyStoryAction[];
};

export const JOURNEY_STORY: JourneyStoryStage[] = [
  {
    key: "planning",
    chapter: "Capítulo 1 · Preparar",
    title: "Planejamento e preparo",
    shortDescription: "Prepare corpo, mente e rotina antes do ciclo.",
    story: "Toda jornada começa antes do procedimento. Este é o momento de reunir informações, organizar a rotina e transformar ansiedade em pequenos passos possíveis.",
    illustration: "planning",
    details: [
      { title: "Avaliação inicial", text: "Centralize consultas e exames importantes." },
      { title: "Estilo de vida", text: "Organize hábitos e orientações recebidas." },
      { title: "Suplementação", text: "Registre somente o que foi orientado pela sua equipe." },
      { title: "Medicamentos", text: "Mantenha horários e lembretes em um só lugar." },
      { title: "Apoio emocional", text: "Reserve espaço para cuidar também de como você se sente." },
    ],
    actions: [{ label: "Ver checklist", href: "/inseminacao?tab=checklist", tone: "soft" }],
  },
  {
    key: "cycle_monitoring",
    chapter: "Capítulo 2 · Observar",
    title: "Acompanhamento do ciclo",
    shortDescription: "Perceba sinais do corpo e registre os momentos importantes.",
    story: "O corpo dá sinais, mas você não precisa guardar tudo na memória. Registre o que percebe e leve um histórico organizado para as conversas com sua equipe de saúde.",
    illustration: "cycle",
    details: [
      { title: "Registrar sintomas", text: "Anote como você está se sentindo hoje." },
      { title: "Temperatura basal", text: "Guarde suas medições em sequência." },
      { title: "Teste de ovulação", text: "Registre o resultado informado pelo teste." },
      { title: "Corrimento cervical", text: "Acompanhe observações pessoais do ciclo." },
    ],
    actions: [
      { label: "Registrar sintomas", href: "/sintomas/registrar", tone: "primary" },
      { label: "Temperatura basal", href: "/ciclo/temperatura", tone: "soft" },
    ],
  },
  {
    key: "insemination_day",
    chapter: "Capítulo 3 · Chegar",
    title: "Dia da inseminação",
    shortDescription: "Um dia importante merece clareza e tranquilidade.",
    story: "Quando o dia chega, menos decisões significam mais espaço para respirar. Deixe documentos, horários e orientações organizados antes de sair.",
    illustration: "insemination",
    details: [
      { title: "O que esperar", text: "Revise as orientações entregues pela clínica." },
      { title: "Preparação antes de sair", text: "Confira horário, deslocamento e instruções." },
      { title: "Documentos e exames", text: "Separe o que precisa acompanhar você." },
      { title: "O que levar", text: "Mantenha sua lista pessoal acessível." },
      { title: "Após a inseminação", text: "Guarde as próximas orientações recebidas." },
    ],
    actions: [{ label: "Ver lembretes", href: "/lembretes", tone: "soft" }],
  },
  {
    key: "post_procedure",
    chapter: "Capítulo 4 · Cuidar",
    title: "Após o procedimento",
    shortDescription: "Cuide de você durante o período de espera.",
    story: "A espera também faz parte da jornada. Este espaço existe para reduzir o ruído: registrar sintomas, lembrar orientações e permitir que cada dia seja apenas um dia de cada vez.",
    illustration: "post",
    details: [
      { title: "Repouso e cuidados", text: "Siga as recomendações específicas recebidas." },
      { title: "Sinais e sintomas", text: "Registre mudanças sem tentar interpretá-las sozinha." },
      { title: "Quando fazer o teste", text: "Mantenha a data indicada visível." },
      { title: "Resultado", text: "Quando chegar o momento, registre o próximo marco." },
      { title: "Apoio emocional", text: "Você pode acompanhar também como está se sentindo." },
    ],
    actions: [{ label: "Registrar sintomas", href: "/sintomas/registrar", tone: "soft" }],
  },
  {
    key: "pregnancy_test",
    chapter: "Capítulo 5 · Descobrir",
    title: "Teste de gravidez",
    shortDescription: "Acompanhe a data e prepare o próximo passo.",
    story: "Chegar até aqui já é uma história inteira. Quando for o momento indicado, tenha a data, o lembrete e as informações da sua jornada reunidas no mesmo lugar.",
    illustration: "test",
    details: [
      { title: "Quando testar", text: "Use a data orientada pela equipe que acompanha você." },
      { title: "Lembrete", text: "Ative um aviso para não precisar contar os dias." },
      { title: "Registrar resultado", text: "Guarde o resultado junto ao histórico da jornada." },
      { title: "Próximos passos", text: "Siga a orientação profissional adequada ao resultado." },
    ],
    actions: [{ label: "Ativar lembrete", href: "/lembretes", tone: "primary" }],
  },
];

export function isJourneyStage(value: string | undefined): value is JourneyStage {
  return JOURNEY_STORY.some((stage) => stage.key === value);
}
