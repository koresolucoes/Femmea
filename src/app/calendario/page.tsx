import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { CalendarIcon, PlusIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { dateInTimeZone, monthMatrix, parseMonthParam, shiftMonth, zonedDateTimeToIso } from "@/lib/date";

type Props = { searchParams: Promise<{ month?: string }> };
type CalendarEvent = { day:number; label:string; kind:"cycle"|"procedure"|"test"|"reminder"|"event"|"medication"; sortAt:string };
type Medication = { id:string; name:string; dose_label:string };
type Dose = { id:string; medication_id:string; scheduled_for:string; status:string };

export default async function CalendarPage({ searchParams }: Props) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("femmea_profiles").select("timezone").eq("id", user.id).maybeSingle();
  const { data: journey } = await supabase.from("femmea_insemination_journeys").select("id,cycle_start_date,procedure_date,pregnancy_test_date").eq("user_id", user.id).order("created_at", { ascending:false }).limit(1).maybeSingle();
  const timeZone = profile?.timezone || "America/Sao_Paulo";
  const params = await searchParams;
  const target = parseMonthParam(params.month, timeZone);
  const month = monthMatrix(timeZone, target);
  const events: CalendarEvent[] = [];
  const monthIso = `${month.year}-${String(month.month).padStart(2,"0")}-01`;
  const nextMonthIso = `${shiftMonth(month.year, month.month, 1)}-01`;
  const monthStart = zonedDateTimeToIso(monthIso, "00:00", timeZone) ?? `${monthIso}T00:00:00Z`;
  const monthEnd = zonedDateTimeToIso(nextMonthIso, "00:00", timeZone) ?? `${nextMonthIso}T00:00:00Z`;

  let medications: Medication[] = [];
  if (journey?.id) {
    const { data } = await supabase.from("femmea_treatment_medications")
      .select("id,name,dose_label")
      .eq("user_id", user.id)
      .eq("journey_id", journey.id)
      .eq("active", true);
    medications = (data ?? []) as Medication[];
  }
  const medicationIds = medications.map((medication) => medication.id);
  const emptyDoseResponse = Promise.resolve({ data: [] as Dose[] });

  const [remindersResponse, journeyEventsResponse, dosesResponse] = await Promise.all([
    supabase.from("femmea_reminders").select("title,scheduled_for,event_id").eq("user_id", user.id).gte("scheduled_for", monthStart).lt("scheduled_for", monthEnd).order("scheduled_for", { ascending:true }),
    supabase.from("femmea_journey_events").select("title,starts_at,status").eq("user_id", user.id).neq("status", "cancelled").gte("starts_at", monthStart).lt("starts_at", monthEnd).order("starts_at", { ascending:true }),
    medicationIds.length
      ? supabase.from("femmea_medication_dose_occurrences")
        .select("id,medication_id,scheduled_for,status")
        .eq("user_id", user.id)
        .in("medication_id", medicationIds)
        .neq("status", "cancelled")
        .gte("scheduled_for", monthStart)
        .lt("scheduled_for", monthEnd)
        .order("scheduled_for", { ascending:true })
      : emptyDoseResponse,
  ]);

  const medicationById = new Map(medications.map((medication) => [medication.id, medication]));
  const formatTime = (value:string) => new Intl.DateTimeFormat("pt-BR", { hour:"2-digit", minute:"2-digit", timeZone }).format(new Date(value));
  const registerDate = (value:string|null|undefined,label:string,kind:CalendarEvent["kind"]) => { if (!value) return; const [year,m,day]=value.slice(0,10).split("-").map(Number); if (year===month.year&&m===month.month) events.push({day,label,kind,sortAt:`${value.slice(0,10)}T00:00:00`}); };
  const registerTimestamp = (value:string|null|undefined,label:string,kind:CalendarEvent["kind"],withTime=true) => { if (!value) return; const local=dateInTimeZone(new Date(value),timeZone); if(local.year===month.year&&local.month===month.month) events.push({day:local.day,label:withTime?`${formatTime(value)} · ${label}`:label,kind,sortAt:value}); };

  registerDate(journey?.cycle_start_date,"Início do ciclo","cycle");
  registerTimestamp(journey?.procedure_date,"Inseminação","procedure",false);
  registerDate(journey?.pregnancy_test_date,"Teste de gravidez","test");
  (remindersResponse.data ?? []).filter((item)=>!item.event_id).forEach((item)=>registerTimestamp(item.scheduled_for,item.title,"reminder"));
  (journeyEventsResponse.data ?? []).forEach((item)=>registerTimestamp(item.starts_at,item.title,"event"));
  ((dosesResponse.data ?? []) as Dose[]).forEach((dose) => {
    const medication = medicationById.get(dose.medication_id);
    if (!medication) return;
    const status = dose.status === "completed" ? "✓" : "○";
    registerTimestamp(dose.scheduled_for, `${status} ${medication.name} · ${medication.dose_label}`, "medication");
  });

  const daysWithEvents=new Set(events.map((event)=>event.day));
  const previousHref=`/calendario?month=${shiftMonth(month.year,month.month,-1)}`;
  const nextHref=`/calendario?month=${shiftMonth(month.year,month.month,1)}`;

  return <MobileShell active="calendar"><header className="calendar-reference-header"><div className="journey-brand">Femmea</div><h1>Calendário</h1></header><section className="calendar-card reference-calendar-card"><div className="calendar-month"><Link href={previousHref} aria-label="Mês anterior">‹</Link><strong>{month.monthLabel}</strong><Link href={nextHref} aria-label="Próximo mês">›</Link></div><div className="calendar-weekdays">{["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((day)=><span key={day}>{day}</span>)}</div><div className="calendar-grid">{month.cells.map((day,index)=>day?<div key={`${day}-${index}`} className={`${day===month.today?"today":""} ${daysWithEvents.has(day)?"has-event":""}`}><span>{day}</span></div>:<div key={`empty-${index}`}/>)}</div></section><section className="calendar-events reference-calendar-events">{events.length===0?<div className="empty-state"><CalendarIcon/><p>Consultas, exames, medicamentos, lembretes e marcos da sua jornada aparecerão aqui.</p></div>:events.sort((a,b)=>a.sortAt.localeCompare(b.sortAt)).map((event,index)=><div className={`event-row event-${event.kind}`} key={`${event.day}-${event.label}-${index}`}><span>{String(event.day).padStart(2,"0")}</span><div><strong>{event.label}</strong><small>{event.kind === "medication" ? "Dose do tratamento" : month.monthLabel}</small></div></div>)}</section><Link className="calendar-fab" href="/lembretes" aria-label="Novo lembrete"><PlusIcon/></Link></MobileShell>;
}
