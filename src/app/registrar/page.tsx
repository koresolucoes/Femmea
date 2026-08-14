import Link from "next/link";
import { CalendarIcon, HeartIcon, SparklesIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { isoDateInTimeZone } from "@/lib/date";
import { createClient } from "@/lib/supabase/server";
import { saveWellbeing } from "./actions";

type Props = { searchParams: Promise<{ saved?: string }> };

const moods = [
  [1, "☹", "Difícil"],
  [2, "🙁", "Sensível"],
  [3, "😐", "Neutra"],
  [4, "🙂", "Bem"],
  [5, "☺", "Muito bem"],
] as const;

export default async function RegisterHubPage({ searchParams }: Props) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("femmea_profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();

  const timeZone = profile?.timezone || "America/Sao_Paulo";
  const today = isoDateInTimeZone(new Date(), timeZone);

  const [{ data: symptomLog }, { data: observation }] = await Promise.all([
    supabase
      .from("femmea_symptom_logs")
      .select("id,emotional_state,notes")
      .eq("user_id", user.id)
      .eq("log_date", today)
      .maybeSingle(),
    supabase
      .from("femmea_cycle_observations")
      .select("basal_temperature_c,ovulation_test_result,cervical_mucus")
      .eq("user_id", user.id)
      .eq("observation_date", today)
      .maybeSingle(),
  ]);

  let symptomCount = 0;
  if (symptomLog?.id) {
    const { count } = await supabase
      .from("femmea_symptom_entries")
      .select("id", { count: "exact", head: true })
      .eq("symptom_log_id", symptomLog.id);
    symptomCount = count ?? 0;
  }

  const params = await searchParams;
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone,
  }).format(new Date());

  return (
    <MobileShell>
      <header className="register-hub-header">
        <Link href="/" className="back-button" aria-label="Voltar">‹</Link>
        <div>
          <div className="journey-brand">Femmea</div>
          <h1>Registrar</h1>
          <p>{dateLabel}</p>
        </div>
        <span className="header-spacer" />
      </header>

      {params.saved === "wellbeing" && <div className="saved-banner">Como você está hoje foi registrado.</div>}

      <section className="register-wellbeing-card">
        <span className="stage-kicker">Seu momento</span>
        <h2>Como você está hoje?</h2>
        <p>Este registro é opcional e independente dos outros. Você pode anotar temperatura, ciclo ou sintomas sem responder aqui.</p>
        <div className="register-mood-row" aria-label="Como você está hoje">
          {moods.map(([value, icon, label]) => (
            <form action={saveWellbeing} key={value}>
              <input type="hidden" name="logDate" value={today} />
              <input type="hidden" name="emotionalState" value={value} />
              <button type="submit" className={symptomLog?.emotional_state === value ? "selected" : ""} aria-label={label} title={label}>
                <span>{icon}</span>
                <small>{label}</small>
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="register-hub-section">
        <div className="register-hub-heading">
          <h2>O que você quer registrar?</h2>
          <p>Escolha diretamente. Nenhum registro depende do outro.</p>
        </div>

        <div className="register-hub-list">
          <Link href="/sintomas/registrar" className="register-hub-item">
            <span className="register-hub-icon"><HeartIcon /></span>
            <span><strong>Sintomas físicos</strong><small>{symptomCount ? `${symptomCount} registrado${symptomCount === 1 ? "" : "s"} hoje` : "Cólicas, inchaço, dor, náusea e outros"}</small></span>
            <b>{symptomCount ? "✓" : "›"}</b>
          </Link>

          <Link href="/ciclo/temperatura" className="register-hub-item">
            <span className="register-hub-icon temperature">°</span>
            <span><strong>Temperatura basal</strong><small>{observation?.basal_temperature_c ? `${observation.basal_temperature_c} °C registrado hoje` : "Adicionar uma medição"}</small></span>
            <b>{observation?.basal_temperature_c ? "✓" : "›"}</b>
          </Link>

          <Link href="/ciclo/teste-ovulacao" className="register-hub-item">
            <span className="register-hub-icon"><SparklesIcon /></span>
            <span><strong>Teste de ovulação</strong><small>{observation?.ovulation_test_result ? "Resultado registrado hoje" : "Guardar o resultado informado pelo teste"}</small></span>
            <b>{observation?.ovulation_test_result ? "✓" : "›"}</b>
          </Link>

          <Link href="/ciclo/corrimento" className="register-hub-item">
            <span className="register-hub-icon mucus">◌</span>
            <span><strong>Corrimento cervical</strong><small>{observation?.cervical_mucus ? "Observação registrada hoje" : "Registrar uma observação do ciclo"}</small></span>
            <b>{observation?.cervical_mucus ? "✓" : "›"}</b>
          </Link>

          <Link href="/lembretes" className="register-hub-item">
            <span className="register-hub-icon"><CalendarIcon /></span>
            <span><strong>Lembrete ou compromisso</strong><small>Consulta, exame, medicamento ou tarefa</small></span>
            <b>›</b>
          </Link>
        </div>
      </section>

      <aside className="register-hub-note">
        <HeartIcon />
        <p><strong>Seu registro, no seu ritmo.</strong> O Femmea organiza o que você decide acompanhar sem transformar cada dado em obrigação.</p>
      </aside>
    </MobileShell>
  );
}
