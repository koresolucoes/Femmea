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

function StageTitle({ stage }: { stage: JourneyStage }) {
  const definition = getStageDefinition(stage);
  const Icon = stage === "planning" ? CalendarIcon : stage === "cycle_monitoring" || stage === "post_procedure" ? HeartIcon : SparklesIcon;

  return (
    <div className="reference-stage-title">
      <span><Icon /></span>
      <div>
        <h2>{definition.title}</h2>
        <p>{definition.shortDescription}</p>
      </div>
    </div>
  );
}

function Checklist({
  items,
}: {
  items: Array<{ id: string; label: string; completed: boolean }>;
}) {
  return (
    <section className="reference-card">
      <h3>Checklist da fase</h3>
      <div className="reference-checklist">
        {items.length === 0 ? <p className="stage-empty">Nenhum item definido para esta fase.</p> : items.map((item) => (
          <form action={toggleChecklistItem} key={item.id}>
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="completed" value={String(item.completed)} />
            <button type="submit" className={item.completed ? "done" : ""}>
              <span>{item.completed && <CheckIcon />}</span>
              {item.label}
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}

export default async function JourneyStagePage({ params, searchParams }: Props) {
  const { stage: rawStage } = await params;
  if (!validStages.has(rawStage as JourneyStage)) notFound();
  const stage = rawStage as JourneyStage;

  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: journey }, { data: profile }] = await Promise.all([
    supabase
      .from("femmea_insemination_journeys")
      .select("id,cycle_start_date,procedure_date,pregnancy_test_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("femmea_profiles")
      .select("timezone,cycle_length_days")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (!journey) redirect("/onboarding");

  const { data: checklistData } = await supabase
    .from("femmea_journey_checklist_items")
    .select("id,label,completed")
    .eq("journey_id", journey.id)
    .eq("user_id", user.id)
    .eq("stage", stage)
    .order("sort_order", { ascending: true });
  const checklist = checklistData ?? [];

  const timeZone = profile?.timezone || "America/Sao_Paulo";
  const cycleLength = profile?.cycle_length_days || 28;
  const today = isoDateInTimeZone(new Date(), timeZone);
  const absoluteCycleDay = getCycleDay(journey.cycle_start_date, timeZone);
  const cycleDay = normalizeCycleDay(absoluteCycleDay, cycleLength);
  const phase = getEstimatedCyclePhase(cycleDay, cycleLength);
  const phaseInfo = CYCLE_PHASES[phase];
  const week = cycleWeekWindow(journey.cycle_start_date, timeZone, cycleLength);

  const [{ data: todaySymptoms }, { data: todayObservation }, { data: pregnancyReminder }] = await Promise.all([
    supabase
      .from("femmea_symptom_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle(),
    supabase
      .from("femmea_cycle_observations")
      .select("basal_temperature_c,ovulation_test_result,cervical_mucus")
      .eq("user_id", user.id)
      .eq("observation_date", today)
      .maybeSingle(),
    supabase
      .from("femmea_reminders")
      .select("id,enabled")
      .eq("user_id", user.id)
      .eq("reminder_type", "pregnancy_test")
      .eq("enabled", true)
      .limit(1)
      .maybeSingle(),
  ]);

  const query = await searchParams;

  return (
    <MobileShell>
      <FemmeaJourneyHeader backHref="/inseminacao?tab=timeline" />
      <JourneyTabs active="timeline" />
      <StageTitle stage={stage} />

      {stage === "planning" && (
        <>
          <section className="reference-card">
            <h3>O que fazer nessa fase?</h3>
            <p>Cuide da sua saúde física e emocional. Alimentação equilibrada, sono de qualidade e controle do estresse fazem toda a diferença.</p>
          </section>
          <Checklist items={checklist} />
        </>
      )}

      {stage === "cycle_monitoring" && (
        <>
          <section className="cycle-phase-card">
            <div>
              <small>Fase atual do ciclo</small>
              <strong>{phaseInfo.label}</strong>
              <span>{cycleDay ? `Dia ${cycleDay} de ${cycleLength}` : "Defina o início do ciclo no planejamento"}</span>
            </div>
            <span className={`phase-flower ${phaseInfo.className}`}>✿</span>
          </section>

          <section className="cycle-strip-card">
            <h3>Calendário do ciclo</h3>
            <div className="cycle-strip">
              {week.map((item) => (
                <div key={item.iso} className={item.isToday ? "today" : ""}>
                  <small>{item.label}</small>
                  <span>{item.dayOfMonth}</span>
                </div>
              ))}
            </div>
            <div className="phase-legend">
              {Object.entries(CYCLE_PHASES).map(([key, value]) => (
                <span key={key}><i className={value.className} />{value.label}</span>
              ))}
            </div>
          </section>

          <section className="reference-action-list">
            <Link href="/sintomas/registrar">
              <span className="action-icon">♙</span>
              <span><strong>Registrar sintomas</strong><small>{todaySymptoms ? "Registrado hoje" : "Como você está se sentindo?"}</small></span>
              <b>›</b>
            </Link>
            <Link href="/ciclo/temperatura">
              <span className="action-icon">♨</span>
              <span><strong>Temperatura basal</strong><small>{todayObservation?.basal_temperature_c ? `${todayObservation.basal_temperature_c} °C hoje` : "Registrar temperatura"}</small></span>
              <b>›</b>
            </Link>
            <Link href="/ciclo/teste-ovulacao">
              <span className="action-icon">◇</span>
              <span><strong>Teste de ovulação</strong><small>{todayObservation?.ovulation_test_result ? "Resultado registrado hoje" : "Registrar resultado"}</small></span>
              <b>›</b>
            </Link>
            <Link href="/ciclo/corrimento">
              <span className="action-icon">▣</span>
              <span><strong>Corrimento cervical</strong><small>{todayObservation?.cervical_mucus ? "Observação registrada hoje" : "Registrar observação"}</small></span>
              <b>›</b>
            </Link>
          </section>

          <section className="reference-card next-steps-card">
            <h3>Próximas etapas</h3>
            <div><CalendarIcon /><span><strong>Monitoramento</strong><small>Acompanhe as datas definidas pela clínica</small></span></div>
            <div><SparklesIcon /><span><strong>Previsão de ovulação</strong><small>O app mostra apenas uma estimativa do ciclo</small></span></div>
          </section>

          <aside className="medical-note">
            <HeartIcon />
            <p><strong>Estimativa do ciclo:</strong> fases e janela de ovulação exibidas pelo Femmea são organizacionais e não substituem ultrassom, exames ou orientação médica.</p>
          </aside>
        </>
      )}

      {stage === "insemination_day" && (
        <>
          <section className="reference-card bullet-card">
            <h3>Antes do procedimento</h3>
            <ul>
              <li>Seguir orientação médica</li>
              <li>Seguir a orientação da clínica sobre preparo, bexiga e alimentação</li>
              <li>Levar documentos e exames solicitados</li>
              <li>Evitar produtos ou condutas que a equipe tenha orientado suspender</li>
            </ul>
          </section>
          <section className="reference-card bullet-card">
            <h3>No dia</h3>
            <ul>
              <li>Chegue com a antecedência combinada</li>
              <li>Confirme documentos, horário e orientações</li>
              <li>Mantenha à mão os contatos da clínica</li>
            </ul>
          </section>
          <section className="stage-date-banner">
            <span><small>Procedimento</small><strong>{formatJourneyDate(journey.procedure_date) ?? "Não definido"}</strong></span>
            <span><small>Teste previsto</small><strong>{formatJourneyDate(journey.pregnancy_test_date) ?? "Não definido"}</strong></span>
          </section>
          <Checklist items={checklist} />
        </>
      )}

      {stage === "post_procedure" && (
        <>
          <section className="reference-card bullet-card">
            <h3>Cuidados importantes</h3>
            <ul>
              <li>Siga as recomendações específicas da sua equipe de saúde</li>
              <li>Mantenha a rotina e atividade conforme orientação recebida</li>
              <li>Continue medicações apenas como prescritas</li>
              <li>Hidrate-se e mantenha alimentação equilibrada</li>
            </ul>
          </section>

          <section className="reference-card alert-card">
            <h3>Sinais de alerta</h3>
            <div>
              <span>△</span>
              <p>Dor intensa, sangramento importante, febre ou qualquer sintoma que preocupe você deve ser comunicado à equipe de saúde responsável.</p>
            </div>
          </section>

          <Link className="secondary-reference-link" href="/sintomas/registrar">Registrar como estou me sentindo</Link>
          <Checklist items={checklist} />
        </>
      )}

      {stage === "pregnancy_test" && (
        <>
          <section className="reference-card test-card">
            <h3>Quando fazer?</h3>
            <p>Use a data indicada pela sua clínica. O Femmea pode sugerir uma data a partir do procedimento, mas a orientação da equipe responsável sempre prevalece.</p>
            <div className="test-date">
              <small>Data prevista no seu planejamento</small>
              <strong>{formatJourneyDate(journey.pregnancy_test_date) ?? "Ainda não definida"}</strong>
            </div>
          </section>

          <section className="reference-card reminder-activate-card">
            <h3>Lembrete</h3>
            <p>Ative um lembrete para não esquecer a data registrada.</p>
            {query.reminder === "1" || pregnancyReminder?.enabled ? (
              <div className="reminder-active"><CheckIcon /> Lembrete ativo</div>
            ) : journey.pregnancy_test_date ? (
              <form action={activatePregnancyTestReminder}>
                <input type="hidden" name="date" value={journey.pregnancy_test_date} />
                <button className="reference-primary-button" type="submit">♧ Ativar lembrete</button>
              </form>
            ) : (
              <Link className="reference-primary-button as-link" href="/inseminacao?tab=timeline">Definir data do teste</Link>
            )}
          </section>

          <Checklist items={checklist} />
        </>
      )}
    </MobileShell>
  );
}
