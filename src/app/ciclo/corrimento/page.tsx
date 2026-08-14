import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { CERVICAL_MUCUS_OPTIONS } from "@/lib/cycle";
import { isoDateInTimeZone } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import { saveCervicalMucus } from "../actions";

export default async function CervicalMucusPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("femmea_profiles").select("timezone").eq("id", user.id).maybeSingle();
  const timeZone = profile?.timezone || "America/Sao_Paulo";
  const today = isoDateInTimeZone(new Date(), timeZone);
  const { data: observation } = await supabase
    .from("femmea_cycle_observations")
    .select("cervical_mucus")
    .eq("user_id", user.id)
    .eq("observation_date", today)
    .maybeSingle();

  return (
    <MobileShell>
      <header className="screen-title-header">
        <Link href="/registrar" className="back-button" aria-label="Voltar à central de registros">‹</Link>
        <div><div className="journey-brand">Femmea</div><h1>Corrimento cervical</h1></div>
        <span className="header-spacer" />
      </header>

      <section className="tracking-hero">
        <span className="tracking-symbol">◌</span>
        <h2>Como está hoje?</h2>
        <p>Use o registro apenas como acompanhamento pessoal do seu ciclo.</p>
      </section>

      <form action={saveCervicalMucus} className="tracking-form">
        <input type="hidden" name="observationDate" value={today} />
        <div className="choice-cards compact">
          {CERVICAL_MUCUS_OPTIONS.map((option) => (
            <label key={option.value}>
              <input type="radio" name="value" value={option.value} defaultChecked={observation?.cervical_mucus === option.value} required />
              <span><strong>{option.label}</strong><small>{option.description}</small></span>
            </label>
          ))}
        </div>
        <button className="reference-primary-button" type="submit">Salvar observação</button>
      </form>
    </MobileShell>
  );
}
