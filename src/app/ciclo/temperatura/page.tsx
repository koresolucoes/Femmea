import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { formatTemperature } from "@/lib/cycle";
import { isoDateInTimeZone } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import { saveBasalTemperature } from "../actions";

type Props = { searchParams: Promise<{ saved?: string }> };

export default async function BasalTemperaturePage({ searchParams }: Props) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("femmea_profiles").select("timezone").eq("id", user.id).maybeSingle();
  const timeZone = profile?.timezone || "America/Sao_Paulo";
  const today = isoDateInTimeZone(new Date(), timeZone);
  const { data: observation } = await supabase
    .from("femmea_cycle_observations")
    .select("basal_temperature_c,notes")
    .eq("user_id", user.id)
    .eq("observation_date", today)
    .maybeSingle();
  const params = await searchParams;

  const { data: historyData } = await supabase
    .from("femmea_cycle_observations")
    .select("observation_date,basal_temperature_c")
    .eq("user_id", user.id)
    .not("basal_temperature_c", "is", null)
    .order("observation_date", { ascending: false })
    .limit(7);
  const history = historyData ?? [];

  return (
    <MobileShell>
      <header className="screen-title-header">
        <Link href="/inseminacao/cycle_monitoring" className="back-button" aria-label="Voltar">‹</Link>
        <div><div className="journey-brand">Femmea</div><h1>Temperatura basal</h1></div>
        <span className="header-spacer" />
      </header>

      <section className="tracking-hero">
        <span className="tracking-symbol">°C</span>
        <p>Registre a temperatura sempre nas condições orientadas pela sua equipe.</p>
        {observation?.basal_temperature_c != null && (
          <strong>{formatTemperature(observation.basal_temperature_c)}</strong>
        )}
      </section>

      <form action={saveBasalTemperature} className="tracking-form">
        <input type="hidden" name="observationDate" value={today} />
        {params.saved === "1" && <div className="saved-banner">Temperatura salva.</div>}
        <label>
          <span>Temperatura de hoje</span>
          <div className="temperature-input">
            <input name="temperature" inputMode="decimal" placeholder="36,50" defaultValue={observation?.basal_temperature_c ?? ""} required />
            <b>°C</b>
          </div>
        </label>
        <label>
          <span>Observações <small>(opcional)</small></span>
          <textarea name="notes" rows={3} defaultValue={observation?.notes ?? ""} placeholder="Horário, qualidade do sono..." />
        </label>
        <button className="reference-primary-button" type="submit">Salvar temperatura</button>
      </form>

      <section className="recent-history">
        <h2>Registros recentes</h2>
        {history.length === 0 ? <p>Nenhuma temperatura registrada ainda.</p> : history.map((item) => (
          <div key={item.observation_date}>
            <span>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(`${item.observation_date}T12:00:00`))}</span>
            <strong>{formatTemperature(item.basal_temperature_c)}</strong>
          </div>
        ))}
      </section>
    </MobileShell>
  );
}
