import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { OVULATION_RESULTS } from "@/lib/cycle";
import { isoDateInTimeZone } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import { saveOvulationTest } from "../actions";

export default async function OvulationTestPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("femmea_profiles").select("timezone").eq("id", user.id).maybeSingle();
  const timeZone = profile?.timezone || "America/Sao_Paulo";
  const today = isoDateInTimeZone(new Date(), timeZone);
  const { data: observation } = await supabase
    .from("femmea_cycle_observations")
    .select("ovulation_test_result")
    .eq("user_id", user.id)
    .eq("observation_date", today)
    .maybeSingle();

  return (
    <MobileShell>
      <header className="screen-title-header">
        <Link href="/registrar" className="back-button" aria-label="Voltar à central de registros">‹</Link>
        <div><div className="journey-brand">Femmea</div><h1>Teste de ovulação</h1></div>
        <span className="header-spacer" />
      </header>

      <section className="tracking-hero">
        <span className="tracking-symbol">LH</span>
        <h2>Resultado de hoje</h2>
        <p>Registre exatamente o resultado do teste utilizado.</p>
      </section>

      <form action={saveOvulationTest} className="tracking-form">
        <input type="hidden" name="observationDate" value={today} />
        <div className="choice-cards">
          {OVULATION_RESULTS.map((option) => (
            <label key={option.value}>
              <input type="radio" name="result" value={option.value} defaultChecked={observation?.ovulation_test_result === option.value} required />
              <span><strong>{option.label}</strong><small>{option.description}</small></span>
            </label>
          ))}
        </div>
        <button className="reference-primary-button" type="submit">Salvar resultado</button>
      </form>
    </MobileShell>
  );
}
