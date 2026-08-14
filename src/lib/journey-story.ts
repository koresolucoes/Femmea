import type { JourneyStage } from "@/types/journey";

export type JourneyIllustrationName = "planning" | "cycle" | "insemination" | "post" | "test";
export type JourneyStoryAction = { label: string; href: string; tone?: "primary" | "soft" };
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
    shortDescription: "Organize os primeiros passos sem carregar tudo na cabeça.",
    story: "Este capítulo reúne o que acontece antes do acompanhamento ativo do ciclo. A ideia é transformar informações espalhadas em uma sequência simples e visível.",
    illustration: "planning",
    details: [
      { title: "Entender o ponto de partida", text: "Guarde aqui as informações que ajudam você a saber onde a jornada começa: consultas já realizadas, exames organizados e dúvidas que ainda quer levar para a equipe." },
      { title: "Organizar sua rotina", text: "Use o Femmea para concentrar datas, lembretes e hábitos que você decidiu acompanhar, sem transformar sua rotina em uma lista infinita de tarefas." },
      { title: "Registrar orientações recebidas", text: "Quando houver uma orientação importante, mantenha o registro associado à etapa certa para encontrá-lo depois sem depender da memória." },
      { title: "Preparar os próximos passos", text: "Antes de avançar, confira o checklist desta fase e deixe visíveis somente os itens que realmente precisam da sua atenção agora." },
      { title: "Cuidar de como você está", text: "A jornada também tem uma dimensão emocional. O registro de como você se sente fica disponível sem competir com o acompanhamento principal." },
    ],
    actions: [{ label: "Ver meu checklist", href: "/inseminacao?tab=checklist", tone: "soft" }],
  },
  {
    key: "cycle_monitoring",
    chapter: "Capítulo 2 · Observar",
    title: "Acompanhamento do ciclo",
    shortDescription: "Veja a fase atual primeiro e escolha depois o que vale registrar.",
    story: "Aqui o ciclo vira o centro da experiência. A fase atual, o calendário e os registros do dia aparecem juntos para que você não precise procurar cada ferramenta em uma tela diferente.",
    illustration: "cycle",
    details: [
      { title: "Onde estou no ciclo?", text: "O Femmea mostra a fase estimada e o dia do ciclo usando as datas registradas. Essa referência aparece antes das ferramentas para manter o contexto sempre visível." },
      { title: "O que quero registrar hoje?", text: "Sintomas, temperatura basal, teste de ovulação e corrimento cervical ficam agrupados nesta etapa. Registre somente o que fizer parte do seu acompanhamento." },
      { title: "O que já registrei?", text: "Os registros do dia mudam de estado depois de salvos, ajudando a enxergar rapidamente o que já está organizado sem repetir tarefas." },
      { title: "O que vem depois?", text: "A seção de próximas etapas mantém consultas, exames e o procedimento no mesmo fluxo para que a jornada tenha continuidade." },
    ],
    actions: [
      { label: "Registrar como estou", href: "/sintomas/registrar", tone: "primary" },
      { label: "Abrir calendário", href: "/calendario", tone: "soft" },
    ],
  },
  {
    key: "insemination_day",
    chapter: "Capítulo 3 · Chegar",
    title: "O grande dia",
    shortDescription: "Reúna horários, documentos e o que precisa lembrar em um único lugar.",
    story: "Quando o procedimento se aproxima, o Femmea reduz a quantidade de decisões. Esta etapa funciona como uma central do dia, com contexto, checklist e lembretes no mesmo capítulo.",
    illustration: "insemination",
    details: [
      { title: "Revisar o dia", text: "Confira a data registrada, os compromissos vinculados e os lembretes ativos antes de sair." },
      { title: "Separar o que acompanha você", text: "Use o checklist para documentos, exames e itens pessoais que você decidiu organizar para esse momento." },
      { title: "Manter as orientações acessíveis", text: "Registre as instruções que recebeu para que estejam fáceis de consultar quando precisar, sem substituir o contato com sua equipe." },
      { title: "Preparar o depois", text: "Deixe o próximo marco visível para que, depois do procedimento, a experiência continue automaticamente no período de espera." },
    ],
    actions: [{ label: "Ver lembretes", href: "/lembretes", tone: "soft" }],
  },
  {
    key: "post_procedure",
    chapter: "Capítulo 4 · Cuidar",
    title: "O tempo de espera",
    shortDescription: "Um dia de cada vez, com contexto e registros sem excesso de interpretação.",
    story: "Depois do procedimento, o app muda de ritmo. O objetivo é diminuir ruído: manter a data do próximo marco, os lembretes e seus registros pessoais organizados enquanto os dias passam.",
    illustration: "post",
    details: [
      { title: "Manter o próximo marco visível", text: "A data registrada para o teste fica ligada a esta etapa para que você não precise contar os dias manualmente." },
      { title: "Registrar sem concluir por conta própria", text: "Você pode guardar sintomas e emoções como histórico pessoal. O Femmea não usa esses registros para dizer qual será o resultado." },
      { title: "Revisar o que foi orientado", text: "Use lembretes e notas para manter acessíveis as orientações que recebeu durante o acompanhamento." },
      { title: "Ter espaço para o emocional", text: "O registro de como você está pode continuar disponível de forma simples, sem transformar cada sensação em uma tarefa." },
    ],
    actions: [{ label: "Registrar como estou", href: "/sintomas/registrar", tone: "soft" }],
  },
  {
    key: "pregnancy_test",
    chapter: "Capítulo 5 · Descobrir",
    title: "Teste e resultado",
    shortDescription: "Acompanhe a data registrada e guarde o resultado como parte da sua história.",
    story: "Este capítulo fecha uma tentativa, mas não apaga o caminho anterior. A data, o lembrete e o resultado ficam ligados à mesma jornada para preservar contexto e histórico.",
    illustration: "test",
    details: [
      { title: "Revisar a data registrada", text: "A tela destaca a data que está salva na jornada e mantém o lembrete associado ao mesmo marco." },
      { title: "Registrar o resultado", text: "Quando você tiver um resultado, pode guardá-lo como positivo, negativo ou inconclusivo sem que o app faça interpretações adicionais." },
      { title: "Preservar esta tentativa", text: "Depois do registro, esta tentativa continua disponível em Minha história com seus principais marcos." },
      { title: "Decidir o próximo caminho", text: "Quando fizer sentido, o Femmea pode iniciar uma nova tentativa sem apagar a anterior ou encerrar a jornada atual." },
    ],
    actions: [{ label: "Ver lembretes", href: "/lembretes", tone: "primary" }],
  },
];

export function isJourneyStage(value: string | undefined): value is JourneyStage {
  return JOURNEY_STORY.some((stage) => stage.key === value);
}
