"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, DropletIcon } from "@/components/icons";
import { addHydration } from "@/app/actions";
import { initialActionState } from "@/lib/action-state";

const presets = [200, 250, 350, 500];

export function HydrationAdd() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(250);
  const [state, formAction, pending] = useActionState(addHydration, initialActionState);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      setOpen(false);
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <>
      <button className="primary-pill" type="button" onClick={() => setOpen(true)}>
        <span className="plus-disc"><PlusIcon /></span>
        Adicionar
        <DropletIcon className="button-sparkle" />
      </button>

      {open && (
        <div className="sheet-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="bottom-sheet" role="dialog" aria-modal="true" aria-label="Adicionar água" onMouseDown={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-icon"><DropletIcon /></div>
            <h2>Adicionar água</h2>
            <p>Quanto você bebeu agora?</p>

            <div className="preset-grid">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={amount === preset ? "selected" : ""}
                  onClick={() => setAmount(preset)}
                >
                  {preset}<small>ml</small>
                </button>
              ))}
            </div>

            <form action={formAction}>
              <input type="hidden" name="amount" value={amount} />
              {state.status === "error" && <p className="form-message error">{state.message}</p>}
              <button className="sheet-submit" disabled={pending}>{pending ? "Salvando..." : `Adicionar ${amount} ml`}</button>
            </form>
            <button type="button" className="sheet-cancel" onClick={() => setOpen(false)}>Cancelar</button>
          </section>
        </div>
      )}
    </>
  );
}
