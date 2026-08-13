"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";
import { initialActionState } from "@/lib/action-state";

export function ProfileForm({ displayName, waterGoal }: { displayName: string; waterGoal: number }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialActionState);
  return (
    <form action={formAction} className="profile-form">
      <label><span>Nome</span><input name="displayName" defaultValue={displayName} minLength={2} required /></label>
      <label><span>Meta diária de água</span><div className="input-suffix"><input name="waterGoal" type="number" min={500} max={5000} step={100} defaultValue={waterGoal} required /><b>ml</b></div></label>
      {state.message && <p className={`form-message ${state.status}`}>{state.message}</p>}
      <button className="profile-save" disabled={pending}>{pending ? "Salvando..." : "Salvar alterações"}</button>
    </form>
  );
}
