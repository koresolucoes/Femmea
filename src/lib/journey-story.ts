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
    shortDescription: "Comece no seu tempo, com o que importa por perto e sem precisar lembrar de tudo sozinha.",
    story: "Toda jornada começa de um jeito diferente. Este é o seu espaço para reunir o que já sabe, o que ainda quer perguntar e os próximos passos que fazem sentido para você. Sem pressa, sem cobrança — apenas um passo de cada vez.",
    illustration: "planning",
    details: [
      { title: "Começar com calma", text: "Reúna suas consultas, exames e dúvidas importantes para enxergar melhor de onde você está partindo e o que ainda precisa organizar." },
      { title: "Deixar a rotina mais leve", text: "Datas e lembretes ficam juntos para que você não precise carregar cada detalhe na cabeça durante um momento que já pode trazer tantas emoções." },
      { title: "Guardar o que sua equipe orientou", text: "Anote orientações que você queira consultar depois e mantenha essas informações próximas quando precisar delas." },
      { title: "Um passo de cada vez", text: "Olhe apenas para o que precisa da sua atenção agora. O restante da jornada pode esperar até chegar o momento certo." },
      { title: "Cuidar de você também", text: "Além de consultas e exames, existe você. Se quiser, registre como está se sentindo e acompanhe seu próprio ritmo ao longo dos dias." },
    ],
    actions: [{ label: "Ver meus próximos passos", href: "/inseminacao?tab=checklist", tone: "soft" }],
  },
  {
    key: "cycle_monitoring",
    chapter: "Capítulo 2 · Observar",
    title: "Acompanhamento do ciclo",
    shortDescription: "Observe seu corpo com carinho e acompanhe cada mudança no seu ritmo.",
    story: "Durante o ciclo, pequenas mudanças podem chamar sua atenção. Aqui você encontra uma visão simples do momento em que está e pode registrar apenas aquilo que fizer sentido para o seu acompanhamento, sem transformar cada dia em uma obrigação.",
    illustration: "cycle",
    details: [
      { title: "Em que fase estou?", text: "Veja o dia e a fase estimada do seu ciclo a partir das datas que você registrou. É uma referência para ajudar na organização, não uma confirmação clínica." },
      { title: "O que faz sentido observar hoje?", text: "Sintomas, temperatura basal, teste de ovulação e corrimento ficam disponíveis aqui. Você escolhe o que deseja acompanhar em cada dia." },
      { title: "O que já guardei?", text: "Seus registros ficam organizados para que você possa olhar para trás sem depender da memória e perceber como foram os seus dias." },
      { title: "O que vem depois?", text: "Consultas, exames e outros marcos aparecem ao longo da jornada para que o próximo passo não chegue de surpresa." },
    ],
    actions: [
      { label: "Registrar meu dia", href: "/registrar", tone: "primary" },
      { label: "Ver meu calendário", href: "/calendario", tone: "soft" },
    ],
  },
  {
    key: "insemination_day",
    chapter: "Capítulo 3 · Chegar",
    title: "O grande dia",
    shortDescription: "Um dia importante, com espaço para chegar mais tranquila e com tudo o que precisa por perto.",
    story: "Quando esse dia chega, ter as informações certas à mão pode deixar o caminho mais simples. Aqui você pode conferir horários, separar o que precisa levar e guardar as orientações que recebeu para viver esse momento com mais presença e menos preocupação com detalhes.",
    illustration: "insemination",
    details: [
      { title: "Antes de sair", text: "Confira horário, endereço, documentos e qualquer lembrete importante para não precisar resolver tudo de última hora." },
      { title: "Leve o que você precisa", text: "Use sua lista para separar exames, documentos e itens pessoais que você decidiu levar com você." },
      { title: "Tenha suas orientações por perto", text: "Deixe acessíveis as instruções que recebeu da sua equipe para consultar sempre que sentir necessidade." },
      { title: "Depois do procedimento", text: "Quando esse momento passar, a jornada continua com mais calma. O próximo capítulo ajuda você a acompanhar os dias de espera sem perder de vista o que realmente importa." },
    ],
    actions: [{ label: "Revisar meus lembretes", href: "/lembretes", tone: "soft" }],
  },
  {
    key: "post_procedure",
    chapter: "Capítulo 4 · Cuidar",
    title: "O tempo de espera",
    shortDescription: "A espera também faz parte da jornada. Um dia de cada vez, com espaço para cuidar de você.",
    story: "Os dias depois do procedimento podem trazer expectativa, dúvidas e vontade de observar cada detalhe. Aqui a proposta é diferente: manter o que você precisa organizado, deixar o próximo marco visível e permitir que você registre como está sem transformar cada sensação em uma resposta.",
    illustration: "post",
    details: [
      { title: "Um dia de cada vez", text: "A data do próximo marco fica visível para que você não precise fazer contas nem voltar ao calendário o tempo todo." },
      { title: "O que você sente importa", text: "Se quiser, registre sintomas e emoções como parte da sua história. Esses registros servem para acompanhar seus dias, não para prever o resultado." },
      { title: "Orientações sempre por perto", text: "Mantenha notas e lembretes com aquilo que sua equipe pediu para você acompanhar durante esse período." },
      { title: "Espaço para suas emoções", text: "Você pode registrar como está se sentindo ou simplesmente seguir o dia. O app está aqui para acompanhar, não para cobrar." },
    ],
    actions: [{ label: "Registrar meu dia", href: "/registrar", tone: "soft" }],
  },
  {
    key: "pregnancy_test",
    chapter: "Capítulo 5 · Descobrir",
    title: "Teste e resultado",
    shortDescription: "Quando chegar a hora, viva esse momento no seu tempo e guarde o resultado como parte da sua história.",
    story: "Chegar até aqui já carrega muitos dias, expectativas e cuidados. O resultado é um marco importante, mas ele não apaga tudo o que você viveu até agora. Quando se sentir pronta, você pode registrá-lo e seguir para o próximo passo com sua história preservada.",
    illustration: "test",
    details: [
      { title: "Quando chegar o dia", text: "A data que você registrou fica destacada para que você saiba quando esse momento está previsto e possa se organizar com tranquilidade." },
      { title: "Guardar o resultado", text: "Quando tiver um resultado, você pode registrá-lo como positivo, negativo ou inconclusivo, sem interpretações automáticas sobre o que ele significa para o seu caso." },
      { title: "Sua história continua aqui", text: "Esta tentativa permanece guardada com seus principais momentos, independentemente do resultado." },
      { title: "E depois?", text: "Cada resultado pode levar a um caminho diferente. Quando fizer sentido, você poderá continuar esta jornada, iniciar uma nova tentativa ou apenas manter este capítulo guardado." },
    ],
    actions: [{ label: "Ver meu lembrete do teste", href: "/lembretes", tone: "primary" }],
  },
];

export function isJourneyStage(value: string | undefined): value is JourneyStage {
  return JOURNEY_STORY.some((stage) => stage.key === value);
}
