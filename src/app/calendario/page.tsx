import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { CalendarIcon, PlusIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { dateInTimeZone, monthMatrix, parseMonthParam, shiftMonth } from "@/lib/date";

type Props = { searchParams: Promise<{ month?: string }> };
type CalendarEvent = { day:number; label:string; kind:"cycle"|"procedure"|"test"|"reminder"|"event" };

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

  const monthStart = `${month.year}-${String(month.month).padStart(2,"0")}-01T00:00:00`;
  const nextMonth = shiftMonth(month.year, month.month, 1);
  const monthEnd = `${nextMonth}-01T00:00:00`;
  const [remindersResponse, journeyEventsResponse] = await Promise.all([
    supabase.from("femmea_reminders").select("title,scheduled_for").eq("user_id", user.id).gte("scheduled_for", monthStart).lt("scheduled_for", monthEnd).order("scheduled_for", { ascending:true }),
    supabase.from("femmea_journey_events").select("title,starts_at,status").eq("user_id", user.id).neq("status", "cancelled").gte("starts_at", monthStart).lt("starts_at", monthEnd).order("starts_at", { ascending:true }),
  ]);

  const registerDate = (value:string|null|undefined, label:string, kind:CalendarEvent["kind"]) => {
    if (!value) return; const [year,m,day] = value.slice(0,10).split("-").map(Number); if (year === month.year && m === month.month) events.push({ day,label,kind });
  };
  const registerTimestamp = (value:string|null|undefined, label:string, kind:CalendarEvent["kind"]) => {
    if (!value) return; const local = dateInTimeZone(new Date(value), timeZone); if (local.year === month.year && local.month === month.month) events.push({ day:local.day,label,kind });
  };

  registerDate(journey?.cycle_start_date, "Início do ciclo", "cycle");
  registerTimestamp(journey?.procedure_date, "Inseminação", "procedure");
  registerDate(journey?.pregnancy_test_date, "Teste de gravidez", "test");
  (remindersResponse.data ?? []).forEach((item) => registerTimestamp(item.scheduled_for, item.title, "reminder"));
  (journeyEventsResponse.data ?? []).forEach((item) => registerTimestamp(item.starts_at, item.title, "event"));

  const daysWithEvents = new Set(events.map((event) => event.day));
  const previousHref = `/calendario?month=${shiftMonth(month.year, month.month, -1)}`;
  const nextHref = `/calendario?month=${shiftMonth(month.year, month.month, 1)}`;

  return <MobileShell active="calendar"><header className="calendar-reference-header"><div className="journey-brand">Femmea</div><h1>Calendário</h1></header><section className="calendar-card reference-calendar-card"><div className="calendar-month"><Link href={previousHref} aria-label="Mês anterior">‹</Link><strong>{month.monthLabel}</strong><Link href={nextHref} aria-label="Próximo mês">›</Link></div><div className="calendar-weekdays">{["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((day)=><span key={day}>{day}</span>)}</div><div className="calendar-grid">{month.cells.map((day,index)=>day?<div key={`${day}-${index}`} className={`${day===month.today?"today":""} ${daysWithEvents.has(day)?"has-event":""}`}><span>{day}</span></div>:<div key={`empty-${index}`}/>)}</div></section><section className="calendar-events reference-calendar-events">{events.length===0?<div className="empty-state"><CalendarIcon/><p>Consultas, exames, lembretes e marcos da sua jornada aparecerão aqui.</p></div>:events.sort((a,b)=>a.day-b.day).map((event,index)=><div className={`event-row event-${event.kind}`} key={`${event.day}-${event.label}-${index}`}><span>{String(event.day).padStart(2,"0")}</span><div><strong>{event.label}</strong><small>{month.monthLabel}</small></div></div>)}</section><Link className="calendar-fab" href="/lembretes" aria-label="Novo lembrete"><PlusIcon/></Link></MobileShell>;
}
