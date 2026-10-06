"use client";

import { useActionState } from "react";
import { startResponse, type EntryState } from "./actions";

type Relation = { id: string; label: string };

export function EntryForm({ projectToken, relations }: { projectToken: string; relations: readonly Relation[] }) {
  const [state, action, pending] = useActionState<EntryState, FormData>(
    startResponse.bind(null, projectToken),
    {},
  );

  return (
    <form action={action} className="stack" style={{ "--gap": "22px" } as React.CSSProperties}>
      <div className="grid-cols grid-cols-2">
        <label className="field">
          <span className="field-label">Seu nome</span>
          <input className="input" name="name" autoComplete="name" required />
        </label>
        <label className="field">
          <span className="field-label">Seu e-mail</span>
          <input className="input" name="email" type="email" autoComplete="email" required />
        </label>
      </div>

      <fieldset style={{ border: 0, padding: 0, marginInline: 0, marginBottom: 0 }}>
        <legend className="field-label">Sua relação com a empresa</legend>
        <div className="chips">
          {relations.map((r) => (
            <label key={r.id} className="chip chip-radio">
              <input className="sr-only" type="radio" name="relation" value={r.id} required />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="field">
        <span className="field-label">
          Cargo ou área <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span>
        </span>
        <input className="input" name="role" placeholder="Ex.: Diretora de marketing" />
      </label>

      {state.error && <p className="error" role="alert">{state.error}</p>}

      <div className="spread" style={{ paddingTop: 6 }}>
        <p className="small muted" style={{ margin: 0, maxWidth: 440 }}>
          Já começou antes? Use o mesmo e-mail e você continua de onde parou.
        </p>
        <button className="pill pill-primary" disabled={pending}>
          {pending ? "Abrindo…" : "Começar"}
        </button>
      </div>
    </form>
  );
}
