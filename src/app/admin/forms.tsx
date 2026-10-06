"use client";

import { useActionState } from "react";
import { login, newProject, type FormState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="stack" style={{ "--gap": "16px" } as React.CSSProperties}>
      <label className="field">
        <span className="field-label">Senha</span>
        <input className="input" type="password" name="password" autoComplete="current-password" autoFocus required />
      </label>
      {state.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}
      <button className="pill pill-primary" style={{ width: "100%" }} disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

export function NewProjectForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(newProject, {});
  return (
    <form action={action}>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <input
          className="input"
          name="name"
          placeholder="Nome do cliente ou da marca"
          aria-label="Nome do cliente"
          required
        />
        <button className="pill pill-primary" disabled={pending}>
          {pending ? "Criando…" : "Criar projeto"}
        </button>
      </div>
      {state.error && (
        <p className="error" role="alert" style={{ marginTop: 8 }}>
          {state.error}
        </p>
      )}
    </form>
  );
}

export function ConfirmButton({
  action,
  label,
  confirm,
  className = "pill pill-danger pill-sm",
}: {
  action: () => Promise<void>;
  label: string;
  confirm: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      <button className={className}>{label}</button>
    </form>
  );
}

export function PrintButton() {
  return (
    <button type="button" className="pill pill-outline pill-sm" onClick={() => window.print()}>
      Exportar PDF
    </button>
  );
}
