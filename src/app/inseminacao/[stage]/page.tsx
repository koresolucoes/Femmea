import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarIcon, CheckIcon, HeartIcon, SparklesIcon } from "@/components/icons";
import { FemmeaJourneyHeader, JourneyTabs } from "@/components/journey-navigation";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { CYCLE_PHASES, cycleWeekWindow, getCycleDay, getEstimatedCyclePhase, normalizeCycleDay } from "@/lib/cycle";
import { isoDateInTimeZone } from "@/lib/date";
import { JOURNEY_STAGES, formatJourneyDate, getStageDefinition } from "@/lib/journey";
import { createClient } from "@/lib/supabase/server";
import type { JourneyStage } from "@/types/journey";
import { activatePregnancyTestReminder } from "@/app/lembretes/actions";
import { toggleChecklistItem } from "../actions";

type Props = {
  params: Promise<{ stage: string }>;
  searchParams: Promise<{ reminder?: string }>;
};

const validStages = new Set(JOURNEY_STAGES.map((stage) => stage.key));

const phaseGuidance = {
  menstruation: {
    title: "O ciclo começou",
    text: "Mantenha o dia do ciclo visível e use os registros somente quando eles ajudarem você a organizar o acompanhamento. O foco aqui é contexto antes de ferramentas.",
    next: "Depois desta fase, o acompanhamento segue para a fase folicular e para os próximos marcos que você registrar na jornada.",
  },
  follicular: {
    title: "Uma fase de acompanhamento",
    text: "Esta referência ajuda a organizar o momento do ciclo junto com consultas, exames e observações que você decidir guardar no Femmea.",
    next: "A próxima referência estimada é a ovulação. Datas e eventos registrados continuam tendo prioridade sobre estimativas do app.",
  },
  ovulation: {
    title: "Uma janela estimada",
    text: "A fase exibida é calculada a partir das datas salvas. Use os registros abaixo como histórico pessoal, sem tratar a estimativa como confirmação do que está acontecendo no corpo.",
    next: "Quando o procedimento estiver marcado, a jornada passa a priorizar o grande dia e seus eventos associados.",
  },
  luteal: {
    title: "Organize o que vem depois",
    text: "Nesta fase, a experiência passa a destacar os próximos marcos da jornada e os registros que você quiser manter acessíveis.",
    next: "Se a inseminação já aconteceu, o próximo capítulo da jornada é o tempo de espera e a data registrada para o teste.",
  },
} as const;

function StageTitle({ stage }: { stage: JourneyStage }) {
  const definition = getStageDefinition(stage);
  const Icon = stage === "planning" ? CalendarIcon : stage === "cycle_monitoring" || stage === "post_procedure" ? HeartIcon : SparklesIcon;
  return <div className="reference-stage-title"><span><Icon /></span><div><h2>{definition.title}</h2><p>{definition.shortDescription}</p></div></div>;
}

function Checklist({ items }: { items: Array<{ id: string; label: string; completed: boolean }> }) {
  return <section className="reference-card"><h3>Checklist da fase</h3><div className="reference-checklist">
    {items.length === 0 ? <p className="stage-empty">Nenhum item definido para esta fase.</p> : items.map((item) => <form action={toggleChecklistItem} key={item.id}><input type="hidden" name="itemId" value={item.id} /><input type="hidden" name="completed" value={String(item.completed)} /><button type="submit" className={item.completed ? "done" : ""}><span>{item.completed && <CheckIcon />}</span>{item.label}</button></form>)}
  </div></section>;
}

export default async function JourneyStagePage({ params, searchParams }: Props) {
  const { stage: rawStage } = await params;
  if (!validStages.has(rawStage as JourneyStage)) notFound();
  const stage = rawStage as JourneyStage;
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: journey }, { data: profile }] = await Promise.all([
    supabase.from("femmea_insemination_journeys").select("id,cycle_start_date,procedure_date,pregnancy_test_date").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("femmea_profiles").select("timezone,cycle_length_days").eq("id", user.id).maybeSingle(),
  ]);
  if (!journey) redirect("/onboarding");

  const { data: checklistData } = await supabase.from("femmea_journey_checklist_items").select("id,label,completed").eq("journey_id", journey.id).eq("user_id", user.id).eq("stage", stage).order("sort_order", { ascending: true });
  const checklist = checklistData ?? [];
  const timeZone = profile?.timezone || "America/Sao_Paulo";
  const cycleLength = profile?.cycle_length_days || 28;
  const today = isoDateInTimeZone(new Date(), timeZone);
  const absoluteCycleDay = getCycleDay(journey.cycle_start_date, timeZone);
  const cycleDay = normalizeCycleDay(absoluteCycleDay, cycleLength);
  const phase = getEstimatedCyclePhase(cycleDay, cycleLength);
  const phaseInfo = CYCLE_PHASES[phase];
  const guidance = phaseGuidance[phase];
  const week = cycleWeekWindow(journey.cycle_start_date, timeZone, cycleLength);

  const [{ data: todaySymptoms }, { data: todayObservation }, { data: pregnancyReminder }] = await Promise.all([
    supabase.from("femmea_symptom_logs").select("id").eq("user_id", user.id).eq("log_date", today).maybeSingle(),
    supabase.from("femmea_cycle_observations").select("basal_temperature_c,ovulation_test_result,cervical_mucus").eq("user_id", user.id).eq("observation_date", today).maybeSingle(),
    supabase.from("femmea_reminders").select("id,enabled").eq("user_id", user.id).eq("reminder_type", "pregnancy_test").eq("enabled", true).limit(1).maybeSingle(),
  ]);
  const query = await searchParams;

  return <MobileShell active="journey">
    <FemmeaJourneyHeader backHref="/inseminacao?tab=timeline" />
    <JourneyTabs active="timeline" />
    <StageTitle stage={stage} />

    {stage === "planning" && <><section className="cycle-guidance-card"><span>O que esta etapa representa</span><h3>Preparar sem sobrecarregar</h3><p>Reúna os principais marcos, datas e itens do checklist antes de avançar. A jornada deve mostrar o próximo passo sem transformar tudo em uma obrigação.</p></section><Checklist items={checklist} /></>}

    {stage === "cycle_monitoring" && <>
      <section className="cycle-phase-card"><div><small>Fase atual do ciclo</small><strong>{phaseInfo.label}</strong><span>{cycleDay ? `Dia ${cycleDay} de ${cycleLength}` : "Defina o início do ciclo no planejamento"}</span></div><span className={`phase-flower ${phaseInfo.className}`}>✿</span></section>

      <section className="cycle-guidance-card"><span>Entenda antes de registrar</span><h3>{guidance.title}</h3><p>{guidance.text}</p></section>

      <section className="cycle-strip-card"><h3>Calendário do ciclo</h3><div className="cycle-strip">{week.map((item) => <div key={item.iso} className={item.isToday ? "today" : ""}><small>{item.label}</small><span>{item.dayOfMonth}</span></div>)}</div><div className="phase-legend">{Object.entries(CYCLE_PHASES).map(([key, value]) => <span key={key}><i className={value.className} />{value.label}</span>)}</div></section>

      <div className="cycle-register-heading"><h3>O que faz sentido registrar hoje?</h3><p>Escolha somente o que você está acompanhando. Todos os registros continuam ligados ao mesmo dia do ciclo.</p></div>
      <section className="reference-action-list">
        <Link href="/sintomas/registrar"><span className="action-icon">♙</span><span><strong>Como estou hoje</strong><small>{todaySymptoms ? "Registrado hoje" : "Sintomas e emocional"}</small></span><b>›</b></Link>
        <Link href="/ciclo/temperatura"><span className="action-icon">♨</span><span><strong>Temperatura basal</strong><small>{todayObservation?.basal_temperature_c ? `${todayObservation.basal_temperature_c} °C hoje` : "Registrar medição"}</small></span><b>›</b></Link>
        <Link href="/ciclo/teste-ovulacao"><span className="action-icon">◇</span><span><strong>Teste de ovulação</strong><small>{todayObservation?.ovulation_test_result ? "Resultado registrado hoje" : "Guardar resultado"}</small></span><b>›</b></Link>
        <Link href="/ciclo/corrimento"><span className="action-icon">▣</span><span><strong>Corrimento cervical</strong><small>{todayObservation?.cervical_mucus ? "Observação registrada hoje" : "Registrar observação"}</small></span><b>›</b></Link>
      </section>

      <section className="reference-card next-steps-card"><h3>O que vem depois?</h3><div><CalendarIcon /><span><strong>Próximos eventos</strong><small>Consultas e exames registrados aparecem no calendário</small></span></div><div><SparklesIcon /><span><strong>Continuidade da jornada</strong><small>{guidance.next}</small></span></div></section>
      <aside className="medical-note"><HeartIcon /><p><strong>Sobre as fases:</strong> o ciclo exibido pelo Femmea é uma referência calculada com as datas registradas. Ele existe para organização e contexto.</p></aside>
    </>}

    {stage === "insemination_day" && <><section className="cycle-guidance-card"><span>O que esta etapa representa</span><h3>Uma central para o grande dia</h3><p>Concentre aqui a data, seus lembretes e o checklist para não precisar procurar informações em diferentes áreas do app.</p></section><section className="reference-card bullet-card"><h3>Antes do procedimento</h3><ul><li>Revisar as orientações recebidas</li><li>Conferir horário e deslocamento</li><li>Separar documentos e exames cadastrados</li></ul></section><section className="stage-date-banner"><span><small>Procedimento</small><strong>{formatJourneyDate(journey.procedure_date) ?? "Não definido"}</strong></span><span><small>Teste registrado</small><strong>{formatJourneyDate(journey.pregnancy_test_date) ?? "Não definido"}</strong></span></section><Checklist items={checklist} /></>}

    {stage === "post_procedure" && <><section className="cycle-guidance-card"><span>O que esta etapa representa</span><h3>Menos ruído durante a espera</h3><p>Mantenha o próximo marco, seus registros e lembretes visíveis sem precisar transformar cada sensação em uma conclusão.</p></section><section className="reference-card bullet-card"><h3>Seu acompanhamento</h3><ul><li>Manter a data do próximo marco visível</li><li>Guardar registros pessoais quando fizer sentido</li><li>Revisar lembretes e anotações da jornada</li></ul></section><Link className="secondary-reference-link" href="/sintomas/registrar">Registrar como estou hoje</Link><Checklist items={checklist} /></>}

    {stage === "pregnancy_test" && <><section className="cycle-guidance-card"><span>O que esta etapa representa</span><h3>Fechar esta tentativa com contexto</h3><p>A data e o resultado ficam associados à mesma jornada para preservar sua história e deixar claro o próximo caminho.</p></section><section className="reference-card test-card"><h3>Data registrada</h3><div className="test-date"><small>Próximo marco da jornada</small><strong>{formatJourneyDate(journey.pregnancy_test_date) ?? "Ainda não definida"}</strong></div></section><section className="reference-card reminder-activate-card"><h3>Lembrete</h3><p>Ative um aviso para não precisar acompanhar a data manualmente.</p>{query.reminder === "1" || pregnancyReminder?.enabled ? <div className="reminder-active"><CheckIcon /> Lembrete ativo</div> : journey.pregnancy_test_date ? <form action={activatePregnancyTestReminder}><input type="hidden" name="date" value={journey.pregnancy_test_date} /><button className="reference-primary-button" type="submit">Ativar lembrete</button></form> : <Link className="reference-primary-button as-link" href="/inseminacao?tab=timeline">Definir data do teste</Link>}</section><Checklist items={checklist} /></>}
  </MobileShell>;
}
