import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { isoDateInTimeZone } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import { saveSymptoms } from "../actions";

const symptoms = [
  ["colicas_leves", "Cólicas leves"],
  ["inchaco", "Inchaço"],
  ["sensibilidade_mamas", "Sensibilidade nas mamas"],
  ["sono", "Sono"],
  ["cansaco", "Cansaço"],
  ["nausea", "Náusea"],
  ["dor_cabeca", "Dor de cabeça"],
  ["dor_pelvica", "Dor pélvica"],
  ["outros", "Outros"],
] as const;

export default async function RegisterSymptomsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("femmea_profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();

  const timeZone = profile?.timezone || "America/Sao_Paulo";
  const today = isoDateInTimeZone(new Date(), timeZone);

  const { data: log } = await supabase
    .from("femmea_symptom_logs")
    .select("id,notes")
    .eq("user_id", user.id)
    .eq("log_date", today)
    .maybeSingle();

  let selected = new Set<string>();
  if (log?.id) {
    const { data: entries } = await supabase
      .from("femmea_symptom_entries")
      .select("symptom_type")
      .eq("symptom_log_id", log.id);
    selected = new Set((entries ?? []).map((entry) => entry.symptom_type));
  }

  return (
    <MobileShell>
      <header className="screen-title-header">
        <Link href="/registrar" className="back-button" aria-label="Voltar à central de registros">‹</Link>
        <div>
          <div className="journey-brand">Femmea</div>
          <h1>Sintomas físicos</h1>
        </div>
        <span className="header-spacer" />
      </header>

      <form action={saveSymptoms} className="symptom-form">
        <input type="hidden" name="logDate" value={today} />

        <section>
          <h2>O que você quer guardar sobre hoje?</h2>
          <p className="form-section-label">Marque somente o que fizer sentido</p>
          <div className="symptom-chips">
            {symptoms.map(([value, label]) => (
              <label key={value}>
                <input type="checkbox" name="symptoms" value={value} defaultChecked={selected.has(value)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <label className="notes-field">
            <span>Observações <small>(opcional)</small></span>
            <textarea
              name="notes"
              maxLength={1200}
              rows={5}
              defaultValue={log?.notes ?? ""}
              placeholder="Algo que você queira lembrar sobre hoje..."
            />
          </label>
        </section>

        <button className="reference-primary-button" type="submit">Salvar sintomas</button>
      </form>
    </MobileShell>
  );
}
