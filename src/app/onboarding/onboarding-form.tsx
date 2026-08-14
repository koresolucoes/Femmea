"use client";

import { useActionState, useState } from "react";
import { initialActionState } from "@/lib/action-state";
import { completeOnboarding } from "./actions";

const moments = [
  ["learning", "Estou começando a me informar", "Quero entender e organizar os primeiros passos."],
  ["clinic_started", "Já comecei acompanhamento com uma clínica", "Já tenho consultas, exames ou orientações."],
  ["cycle_monitoring", "Estou acompanhando meu ciclo", "Quero registrar sinais e momentos importantes."],
  ["procedure_scheduled", "Minha inseminação já está marcada", "Já tenho uma data para o procedimento."],
  ["post_procedure", "Já fiz a inseminação", "Estou no período de espera após o procedimento."],
  ["waiting_test", "Estou esperando para fazer o teste", "Quero acompanhar a data indicada e meus registros."],
] as const;

type EntryPoint = typeof moments[number][0];

export function OnboardingForm({ initialName = "" }: { initialName?: string }) {
  const [state, formAction, pending] = useActionState(completeOnboarding, initialActionState);
  const [step, setStep] = useState(0);
  const [entryPoint, setEntryPoint] = useState<EntryPoint>("learning");
  const [hydrationEnabled, setHydrationEnabled] = useState(false);

  return <form action={formAction} className="onboarding-form onboarding-flow">
    <input type="hidden" name="entryPoint" value={entryPoint} />
    <input type="hidden" name="hydrationEnabled" value={String(hydrationEnabled)} />
    <div className="onboarding-flow-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>

    {step === 0 && <section className="onboarding-flow-step">
      <span className="stage-kicker">Antes de tudo</span><h2>Como você quer ser chamada?</h2><p>Vamos começar pelo essencial. O restante aparece conforme fizer sentido.</p>
      <label><span>Seu nome</span><input name="displayName" defaultValue={initialName} required minLength={2} maxLength={80} /></label>
      <button type="button" className="onboarding-next" onClick={() => setStep(1)}>Continuar</button>
    </section>}

    {step === 1 && <section className="onboarding-flow-step">
      <span className="stage-kicker">Sua jornada começa onde você está</span><h2>Em que momento você está hoje?</h2><p>O Femmea adapta a experiência ao seu momento atual.</p>
      <div className="onboarding-moment-list">{moments.map(([value,title,text]) => <label key={value} className={entryPoint === value ? "selected" : ""}><input type="radio" checked={entryPoint === value} onChange={() => setEntryPoint(value)} /><span><strong>{title}</strong><small>{text}</small></span></label>)}</div>
      <div className="onboarding-flow-actions"><button type="button" onClick={() => setStep(0)}>Voltar</button><button type="button" className="onboarding-next" onClick={() => setStep(2)}>Continuar</button></div>
    </section>}

    {step === 2 && <section className="onboarding-flow-step">
      <span className="stage-kicker">Só o que ajuda agora</span><h2>Personalize o ponto de partida</h2><p>Adicione somente as datas que você já sabe. Tudo pode ser alterado depois.</p>
      {(entryPoint === "cycle_monitoring" || entryPoint === "procedure_scheduled" || entryPoint === "post_procedure" || entryPoint === "waiting_test") && <label><span>Primeiro dia do ciclo atual <small>opcional</small></span><input name="cycleStartDate" type="date" /></label>}
      {(entryPoint === "procedure_scheduled" || entryPoint === "post_procedure" || entryPoint === "waiting_test") && <label><span>Data da inseminação</span><input name="procedureDate" type="date" required /></label>}
      {entryPoint === "waiting_test" && <label><span>Data indicada para o teste <small>opcional</small></span><input name="pregnancyTestDate" type="date" /></label>}
      <label className="onboarding-toggle-row"><input type="checkbox" checked={hydrationEnabled} onChange={(event) => setHydrationEnabled(event.target.checked)} /><span><strong>Acompanhar hidratação</strong><small>Opcional. Fica como um hábito discreto na tela Hoje.</small></span></label>
      {hydrationEnabled && <label><span>Meta diária de água</span><div className="input-suffix"><input name="waterGoal" type="number" defaultValue={2000} min={500} max={5000} step={100} /><b>ml</b></div></label>}
      <div className="onboarding-tip"><strong>Você continua no controle.</strong><p>Estimativas do app serão identificadas como estimativas. Orientações clínicas continuam sendo definidas pela sua equipe.</p></div>
      {state.message && <p className={`form-message ${state.status}`}>{state.message}</p>}
      <div className="onboarding-flow-actions"><button type="button" onClick={() => setStep(1)}>Voltar</button><button className="onboarding-submit" disabled={pending}>{pending ? "Preparando..." : "Entrar no Femmea"}</button></div>
    </section>}
  </form>;
}
