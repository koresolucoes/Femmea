import Link from "next/link";
import { BellIllustration } from "@/components/illustrations/bell";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createReminder, toggleReminder } from "./actions";

type Props = { searchParams: Promise<{ created?: string }> };

const reminderLabels: Record<string, string> = {
  medication: "Medicação",
  supplement: "Suplementos",
  appointment: "Consulta ou exame",
  cycle: "Dia do ciclo",
  pregnancy_test: "Teste de gravidez",
  custom: "Lembrete",
};

function formatReminderDate(value: string) {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date),
    time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date),
  };
}

export default async function RemindersPage({ searchParams }: Props) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: remindersData } = await supabase
    .from("femmea_reminders")
    .select("id,title,reminder_type,scheduled_for,enabled")
    .eq("user_id", user.id)
    .order("scheduled_for", { ascending: true });
  const reminders = remindersData ?? [];
  const params = await searchParams;

  return (
    <MobileShell>
      <header className="screen-title-header">
        <Link href="/perfil" className="back-button" aria-label="Voltar">‹</Link>
        <div><div className="journey-brand">Femmea</div><h1>Lembretes</h1></div>
        <span className="header-spacer" />
      </header>

      <section className="reminder-story-hero">
        <BellIllustration />
        <div><span className="stage-kicker">Pequenos avisos, menos peso mental</span><h2>Deixe o Femmea lembrar por você</h2><p>Organize horários e datas importantes sem precisar manter tudo na cabeça.</p></div>
      </section>

      {params.created === "1" && <div className="saved-banner">Novo lembrete criado.</div>}

      <section className="reminder-list">
        {reminders.length === 0 ? (
          <div className="empty-state"><p>Seus lembretes importantes aparecerão aqui.</p></div>
        ) : reminders.map((reminder) => {
          const formatted = formatReminderDate(reminder.scheduled_for);
          return (
            <div className="reminder-row" key={reminder.id}>
              <span className="reminder-icon">◷</span>
              <div><strong>{reminder.title}</strong><small>{reminderLabels[reminder.reminder_type] ?? "Lembrete"} · {formatted.date} às {formatted.time}</small></div>
              <form action={toggleReminder}>
                <input type="hidden" name="reminderId" value={reminder.id} />
                <input type="hidden" name="enabled" value={String(reminder.enabled)} />
                <button className={`toggle-switch ${reminder.enabled ? "on" : ""}`} aria-label={reminder.enabled ? "Desativar lembrete" : "Ativar lembrete"}><span /></button>
              </form>
            </div>
          );
        })}
      </section>

      <details className="new-reminder-card story-new-reminder">
        <summary>+ Novo lembrete</summary>
        <form action={createReminder}>
          <label><span>Título</span><input name="title" maxLength={100} placeholder="Ex.: Ultrassom" required /></label>
          <label><span>Tipo</span><select name="type" defaultValue="appointment"><option value="medication">Medicação</option><option value="supplement">Suplemento</option><option value="appointment">Consulta ou exame</option><option value="cycle">Ciclo</option><option value="pregnancy_test">Teste de gravidez</option><option value="custom">Outro</option></select></label>
          <div className="two-field-row"><label><span>Data</span><input name="date" type="date" required /></label><label><span>Horário</span><input name="time" type="time" defaultValue="09:00" required /></label></div>
          <button className="reference-primary-button" type="submit">Criar lembrete</button>
        </form>
      </details>
    </MobileShell>
  );
}
