import Link from "next/link";
import { MedicationForm } from "@/components/treatment/medication-form";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { addDaysToIsoDate, isoDateInTimeZone, zonedDateTimeToIso } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import { completeDose, reopenDose } from "./actions";

const categoryLabels: Record<string, string> = {
  ovarian_stimulation: "Estimulação ovariana",
  ovulation_induction: "Indução da ovulação",
  progesterone_support: "Progesterona / suporte",
  other: "Outro",
};

const routeLabels: Record<string, string> = {
  injection: "💉 Injeção",
  oral: "💊 Oral",
  vaginal: "🌷 Vaginal",
  other: "Outra via",
};

type Props = { searchParams: Promise<{ created?: string; error?: string }> };
type Medication = {
  id: string;
  name: string;
  category: string;
  dose_label: string;
  administration_route: string;
  start_date: string;
  end_date: string;
  active: boolean;
};
type Schedule = { id: string; medication_id: string; local_time: string };
type Dose = {
  id: string;
  medication_id: string;
  scheduled_for: string;
  status: string;
  completed_at: string | null;
};

function dateLabel(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export default async function MedicationsPage({ searchParams }: Props) {
  const user = await requireUser();
  const supabase = await createClient();
  const params = await searchParams;

  const [{ data: profile }, { data: journey }] = await Promise.all([
    supabase.from("femmea_profiles").select("timezone").eq("id", user.id).maybeSingle(),
    supabase.from("femmea_insemination_journeys")
      .select("id,treatment_id,status")
      .eq("user_id", user.id)
      .in("status", ["active", "paused", "postponed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const timeZone = profile?.timezone || "America/Sao_Paulo";
  const today = isoDateInTimeZone(new Date(), timeZone);
  const tomorrow = addDaysToIsoDate(today, 1);
  const todayStart = zonedDateTimeToIso(today, "00:00", timeZone) ?? `${today}T00:00:00Z`;
  const tomorrowStart = zonedDateTimeToIso(tomorrow, "00:00", timeZone) ?? `${tomorrow}T00:00:00Z`;

  let medications: Medication[] = [];
  if (journey?.id) {
    const { data } = await supabase.from("femmea_treatment_medications")
      .select("id,name,category,dose_label,administration_route,start_date,end_date,active")
      .eq("user_id", user.id)
      .eq("journey_id", journey.id)
      .order("start_date", { ascending: true });
    medications = (data ?? []) as Medication[];
  }

  const medicationIds = medications.map((medication) => medication.id);
  let schedules: Schedule[] = [];
  let todayDoses: Dose[] = [];

  if (medicationIds.length) {
    const [scheduleResponse, doseResponse] = await Promise.all([
      supabase.from("femmea_medication_schedules")
        .select("id,medication_id,local_time")
        .eq("user_id", user.id)
        .in("medication_id", medicationIds)
        .order("local_time", { ascending: true }),
      supabase.from("femmea_medication_dose_occurrences")
        .select("id,medication_id,scheduled_for,status,completed_at")
        .eq("user_id", user.id)
        .in("medication_id", medicationIds)
        .gte("scheduled_for", todayStart)
        .lt("scheduled_for", tomorrowStart)
        .neq("status", "cancelled")
        .order("scheduled_for", { ascending: true }),
    ]);
    schedules = (scheduleResponse.data ?? []) as Schedule[];
    todayDoses = (doseResponse.data ?? []) as Dose[];
  }

  const medicationById = new Map(medications.map((medication) => [medication.id, medication]));
  const schedulesByMedication = new Map<string, Schedule[]>();
  for (const schedule of schedules) {
    schedulesByMedication.set(schedule.medication_id, [...(schedulesByMedication.get(schedule.medication_id) ?? []), schedule]);
  }

  const now = Date.now();
  const formatTime = (value: string) => new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));

  return (
    <MobileShell active="journey">
      <header className="treatment-header">
        <Link href="/inseminacao" className="back-button" aria-label="Voltar">‹</Link>
        <div><div className="journey-brand">Femmea</div><h1>Seus medicamentos</h1></div>
        <span className="header-spacer" />
      </header>

      <section className="treatment-hero">
        <span className="treatment-hero-icon" aria-hidden="true">💊</span>
        <div>
          <span className="stage-kicker">Diário do tratamento</span>
          <h2>Organize o que sua equipe prescreveu</h2>
          <p>Reúna medicamentos, doses e horários em um só lugar e acompanhe cada registro ao longo da sua jornada.</p>
        </div>
      </section>

      <aside className="treatment-safety" role="note">
        <strong>O Femmea organiza seu tratamento, mas não prescreve.</strong>
        <p>Cadastre somente medicamentos, doses e horários orientados pela sua equipe de saúde. Não altere a dose, o horário nem interrompa o tratamento sem orientação profissional.</p>
      </aside>

      {params.created === "1" && <div className="saved-banner">Medicamento adicionado à sua jornada e ao calendário.</div>}
      {params.error === "validation" && <div className="treatment-error">Revise os campos. O período pode ter até 120 dias e cada medicamento pode ter até 4 horários.</div>}
      {params.error === "save" && <div className="treatment-error">Não foi possível salvar esse medicamento. Seus dados anteriores não foram alterados.</div>}

      <section className="treatment-section">
        <div className="treatment-section-heading">
          <div><small>Hoje · {dateLabel(today)}</small><h2>Doses do dia</h2></div>
          <Link href="/calendario">Ver calendário</Link>
        </div>

        {todayDoses.length === 0 ? (
          <div className="treatment-empty">Nenhuma dose cadastrada para hoje. Quando houver horários ativos, eles aparecerão aqui.</div>
        ) : (
          <div className="treatment-dose-list">
            {todayDoses.map((dose) => {
              const medication = medicationById.get(dose.medication_id);
              if (!medication) return null;
              const completed = dose.status === "completed";
              const overdue = !completed && new Date(dose.scheduled_for).getTime() < now;
              return (
                <article className={`treatment-dose-row ${completed ? "is-completed" : overdue ? "is-overdue" : ""}`} key={dose.id}>
                  <span className="treatment-dose-icon" aria-hidden="true">{medication.administration_route === "injection" ? "💉" : "💊"}</span>
                  <div className="treatment-dose-copy">
                    <div><strong>{medication.name}</strong><b>{formatTime(dose.scheduled_for)}</b></div>
                    <small>{medication.dose_label}</small>
                    <span className={`dose-status ${completed ? "dose-status-completed" : overdue ? "dose-status-overdue" : "dose-status-pending"}`}>
                      {completed ? "✓ Dose registrada como realizada" : overdue ? "Ainda não registrada como realizada" : "Programada"}
                    </span>
                  </div>
                  {completed ? (
                    <form action={reopenDose}>
                      <input type="hidden" name="doseId" value={dose.id} />
                      <button className="dose-secondary-action" type="submit">Corrigir</button>
                    </form>
                  ) : (
                    <form action={completeDose}>
                      <input type="hidden" name="doseId" value={dose.id} />
                      <button className="dose-primary-action" type="submit">✓ Dose realizada</button>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        )}
        <p className="treatment-overdue-note">Se um horário já passou, o Femmea apenas informa que a dose ainda não foi registrada. Ele não orienta tomar, compensar ou pular uma dose.</p>
      </section>

      <section className="treatment-section">
        <div className="treatment-section-heading"><div><small>Sua prescrição cadastrada</small><h2>Medicamentos</h2></div><span>{medications.filter((item) => item.active).length} ativos</span></div>
        {medications.length === 0 ? (
          <div className="treatment-empty">Você ainda não cadastrou medicamentos nesta jornada.</div>
        ) : (
          <div className="medication-list">
            {medications.map((medication) => (
              <article className={`medication-card ${medication.active ? "" : "is-inactive"}`} key={medication.id}>
                <div className="medication-card-top">
                  <div><strong>{medication.name}</strong><small>{categoryLabels[medication.category] ?? "Tratamento"}</small></div>
                  <span className="medication-chip">{medication.dose_label}</span>
                </div>
                <div className="medication-meta"><span>{routeLabels[medication.administration_route] ?? "Outra via"}</span><span>{dateLabel(medication.start_date)} → {dateLabel(medication.end_date)}</span></div>
                <div className="schedule-pills">
                  {(schedulesByMedication.get(medication.id) ?? []).map((schedule) => <span key={schedule.id}>{schedule.local_time.slice(0, 5)}</span>)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {!journey?.id ? (
        <section className="treatment-empty">Conclua a configuração da sua jornada antes de cadastrar medicamentos.</section>
      ) : (
        <details className="medication-add-card" open={medications.length === 0}>
          <summary>+ Adicionar medicamento</summary>
          <MedicationForm />
        </details>
      )}
    </MobileShell>
  );
}
