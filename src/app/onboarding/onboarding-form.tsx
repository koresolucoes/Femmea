"use client";

import { useActionState } from "react";
import { completeOnboarding } from "./actions";
import { initialActionState } from "@/lib/action-state";

export function OnboardingForm({ initialName = "" }: { initialName?: string }) {
  const [state, formAction, pending] = useActionState(completeOnboarding, initialActionState);

  return (
    <form action={formAction} className="onboarding-form">
      <label>
        <span>Como você quer ser chamada?</span>
        <input name="displayName" defaultValue={initialName} required minLength={2} maxLength={80} />
      </label>

      <label>
        <span>Meta diária de água</span>
        <div className="input-suffix"><input name="waterGoal" type="number" defaultValue={2000} min={500} max={5000} step={100} required /><b>ml</b></div>
      </label>

      <label>
        <span>Primeiro dia do ciclo atual <small>opcional</small></span>
        <input name="cycleStartDate" type="date" />
      </label>

      <div className="onboarding-tip">
        <strong>Você poderá alterar tudo depois.</strong>
        <p>Essas informações servem apenas para personalizar a primeira versão da sua jornada.</p>
      </div>

      {state.message && <p className={`form-message ${state.status}`}>{state.message}</p>}
      <button className="onboarding-submit" disabled={pending}>{pending ? "Configurando..." : "Começar minha jornada"}</button>
    </form>
  );
}
