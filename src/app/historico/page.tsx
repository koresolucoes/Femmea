import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { requireUser } from "@/lib/auth";
import { JOURNEY_STATE_META, isJourneyState, outcomeLabel } from "@/lib/journey-state";
import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: attemptsData } = await supabase.from("femmea_insemination_journeys").select("id,attempt_number,current_state,status,outcome,cycle_start_date,procedure_date,pregnancy_test_date,created_at,ended_at").eq("user_id", user.id).order("attempt_number", { ascending:false }).order("created_at", { ascending:false });
  const attempts = attemptsData ?? [];
  return <MobileShell active="profile"><header className="screen-title-header"><Link href="/perfil" className="back-button" aria-label="Voltar">‹</Link><div><div className="journey-brand">Femmea</div><h1>Minha história</h1></div><span className="header-spacer" /></header><section className="history-intro"><span className="stage-kicker">Nada é apagado</span><h2>Suas tentativas ficam organizadas no tempo</h2><p>Cada tentativa mantém seus principais marcos e resultado registrado, sem misturar uma jornada com a seguinte.</p></section><div className="attempt-history-list">{attempts.length===0?<div className="today-empty">Sua primeira tentativa aparecerá aqui quando a jornada for criada.</div>:attempts.map((attempt)=>{const state=isJourneyState(attempt.current_state)?JOURNEY_STATE_META[attempt.current_state]:null;const outcome=outcomeLabel(attempt.outcome);return <Link href={`/historico/${attempt.id}`} className={`attempt-history-card ${attempt.status==="active"?"is-active":""}`} key={attempt.id}><div className="attempt-history-number"><span>{String(attempt.attempt_number??1).padStart(2,"0")}</span></div><div><small>{attempt.status==="active"?"Em andamento":"Tentativa registrada"}</small><strong>Tentativa {attempt.attempt_number??1}</strong><p>{outcome?`Resultado: ${outcome}`:state?.label??"Jornada registrada"}</p></div><b>›</b></Link>;})}</div></MobileShell>;
}
