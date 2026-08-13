import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { CalendarIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { monthMatrix, parseMonthParam, shiftMonth } from "@/lib/date";

type Props = { searchParams: Promise<{ month?: string }> };

type CalendarEvent = { day: number; label: string; kind: "cycle" | "procedure" | "test" | "reminder" };

export default async function CalendarPage({ searchParams }: Props) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("femmea_profiles").select("timezone").eq("id", user.id).maybeSingle();
  const { data: journey } = await supabase.from("femmea_insemination_journeys").select("cycle_start_date,procedure_date,pregnancy_test_date").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const timeZone = profile?.timezone || "America/Sao_Paulo";
  const params = await searchParams;
  const target = parseMonthParam(params.month, timeZone);
  const month = monthMatrix(timeZone, target);
  const events: CalendarEvent[] = [];

  const monthStart = `${month.year}-${String(month.month).padStart(2, "0")}-01T00:00:00`;
  const nextMonth = shiftMonth(month.year, month.month, 1);
  const monthEnd = `${nextMonth}-01T00:00:00`;
  const { data: remindersData } = await supabase
    .from("femmea_reminders")
    .select("title,scheduled_for")
    .eq("user_id", user.id)
    .gte("scheduled_for", monthStart)
    .lt("scheduled_for", monthEnd)
    .order("scheduled_for", { ascending: true });
  const femmeaReminders = remindersData ?? [];

  const register = (dateValue: string | null, label: string, kind: CalendarEvent["kind"]) => {
    if (!dateValue) return;
    const [year, m, day] = dateValue.slice(0, 10).split("-").map(Number);
    if (year === month.year && m === month.month) events.push({ day, label, kind });
  };

  register(journey?.cycle_start_date || null, "Início do ciclo", "cycle");
  register(journey?.procedure_date || null, "Inseminação", "procedure");
  register(journey?.pregnancy_test_date || null, "Teste de gravidez", "test");
  femmeaReminders.forEach((reminder) => register(reminder.scheduled_for, reminder.title, "reminder"));

  const daysWithEvents = new Set(events.map((event) => event.day));
  const previousHref = `/calendario?month=${shiftMonth(month.year, month.month, -1)}`;
  const nextHref = `/calendario?month=${shiftMonth(month.year, month.month, 1)}`;

  return (
    <MobileShell active="calendar">
      <header className="simple-header"><h1>Calendário</h1></header>
      <section className="calendar-card">
        <div className="calendar-month">
          <Link href={previousHref} aria-label="Mês anterior">‹</Link>
          <strong>{month.monthLabel}</strong>
          <Link href={nextHref} aria-label="Próximo mês">›</Link>
        </div>
        <div className="calendar-weekdays">{["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">
          {month.cells.map((day, index) => day ? <div key={`${day}-${index}`} className={`${day === month.today ? "today" : ""} ${daysWithEvents.has(day) ? "has-event" : ""}`}><span>{day}</span></div> : <div key={`empty-${index}`} />)}
        </div>
      </section>
      <section className="calendar-events">
        <h2>Eventos da jornada</h2>
        {events.length === 0 ? <div className="empty-state"><CalendarIcon /><p>As datas importantes da sua jornada aparecerão aqui.</p></div> : events.sort((a,b)=>a.day-b.day).map((event, index) => <div className="event-row" key={`${event.day}-${event.label}-${index}`}><span>{event.day}</span><div><strong>{event.label}</strong><small>{month.monthLabel}</small></div></div>)}
      </section>
    </MobileShell>
  );
}
