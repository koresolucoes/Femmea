import Link from "next/link";
import { notFound } from "next/navigation";
import { PregnancyIllustration } from "@/components/illustrations/pregnancy";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { JOURNEY_STATE_META, isJourneyState, outcomeLabel } from "@/lib/journey-state";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };

function dateLabel(value: string | null) {
  if (!value) return "Não registrado";
  const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

export default async function AttemptHistoryDetail({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;
  const supabase = await createClient();
  const { data: attempt } = await supabase.from("femmea_insemination_journeys").select("id,attempt_number,current_state,status,outcome,cycle_start_date,procedure_date,pregnancy_test_date,created_at,ended_at").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!attempt) notFound();
  const state = isJourneyState(attempt.current_state) ? JOURNEY_STATE_META[attempt.current_state] : null;
  const result = outcomeLabel(attempt.outcome);

  return <MobileShell active="profile"><header className="screen-title-header"><Link href="/historico" className="back-button" aria-label="Voltar">‹</Link><div><div className="journey-brand">Femmea</div><h1>Tentativa {attempt.attempt_number ?? 1}</h1></div><span className="header-spacer" /></header>{attempt.outcome === "positive" && <section className="history-result-art"><PregnancyIllustration /></section>}<section className="history-attempt-summary"><span className="stage-kicker">Registro da jornada</span><h2>{result ? `Resultado: ${result}` : state?.label ?? "Tentativa registrada"}</h2><p>Este registro preserva os principais marcos desta tentativa. Ele não é alterado quando uma nova tentativa começa.</p></section><div className="history-milestones"><div><small>Início do ciclo</small><strong>{dateLabel(attempt.cycle_start_date)}</strong></div><div><small>Procedimento</small><strong>{dateLabel(attempt.procedure_date)}</strong></div><div><small>Teste</small><strong>{dateLabel(attempt.pregnancy_test_date)}</strong></div><div><small>Status</small><strong>{attempt.status === "completed" ? "Concluída" : attempt.status === "cancelled" ? "Cancelada" : "Em acompanhamento"}</strong></div></div><aside className="medical-note"><p>Histórico organizacional da usuária. Resultados, condutas e próximos passos devem ser confirmados com a equipe de saúde responsável.</p></aside></MobileShell>;
}
