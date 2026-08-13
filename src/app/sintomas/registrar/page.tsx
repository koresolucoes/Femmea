import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { isoDateInTimeZone } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import { saveSymptoms } from "../actions";

type Props = { searchParams: Promise<{ saved?: string }> };

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

const moods = [
  [1, "☹", "Muito mal"],
  [2, "🙁", "Mal"],
  [3, "😐", "Neutra"],
  [4, "🙂", "Bem"],
  [5, "☺", "Muito bem"],
] as const;

export default async function RegisterSymptomsPage({ searchParams }: Props) {
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
    .select("id,emotional_state,notes")
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

  const params = await searchParams;

  return (
    <MobileShell>
      <header className="screen-title-header">
        <Link href="/inseminacao/cycle_monitoring" className="back-button" aria-label="Voltar">‹</Link>
        <div>
          <div className="journey-brand">Femmea</div>
          <h1>Registrar sintomas</h1>
        </div>
        <span className="header-spacer" />
      </header>

      <form action={saveSymptoms} className="symptom-form">
        <input type="hidden" name="logDate" value={today} />

        {params.saved === "1" && (
          <div className="saved-banner">Registro salvo para hoje.</div>
        )}

        <section>
          <h2>Como você está se sentindo hoje?</h2>
          <p className="form-section-label">Sintomas físicos</p>
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
          <p className="form-section-label">Emocional</p>
          <div className="mood-picker">
            {moods.map(([value, icon, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="emotionalState"
                  value={value}
                  defaultChecked={(log?.emotional_state ?? 3) === value}
                />
                <span aria-label={label} title={label}>{icon}</span>
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
              placeholder="Escreva aqui..."
            />
          </label>
        </section>

        <button className="reference-primary-button" type="submit">Salvar registro</button>
      </form>
    </MobileShell>
  );
}
