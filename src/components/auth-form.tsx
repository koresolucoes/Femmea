"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";

type Props = {
  mode: "login" | "signup" | "reset" | "update-password";
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
};

const copy = {
  login: {
    kicker: "Bem-vinda de volta",
    title: "Entre na sua jornada",
    subtitle: "Acompanhe cada etapa com calma, informação e organização.",
    button: "Entrar",
  },
  signup: {
    kicker: "Sua jornada começa aqui",
    title: "Crie sua conta",
    subtitle: "Configure seu acompanhamento personalizado em poucos minutos.",
    button: "Criar conta",
  },
  reset: {
    kicker: "Recuperar acesso",
    title: "Redefina sua senha",
    subtitle: "Enviaremos um link seguro para o seu e-mail.",
    button: "Enviar link",
  },
  "update-password": {
    kicker: "Nova senha",
    title: "Proteja sua conta",
    subtitle: "Escolha uma senha nova com pelo menos 8 caracteres.",
    button: "Salvar nova senha",
  },
} as const;

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const content = copy[mode];
  const showEmail = mode !== "update-password";
  const showPassword = mode === "login" || mode === "signup" || mode === "update-password";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-flower" aria-hidden>✦</div>
        <p className="auth-brand">Femmea</p>
        <p className="auth-kicker">{content.kicker}</p>
        <h1>{content.title}</h1>
        <p className="auth-subtitle">{content.subtitle}</p>

        <form action={formAction} className="auth-form">
          {mode === "signup" && (
            <label>
              <span>Como você quer ser chamada?</span>
              <input name="displayName" autoComplete="name" placeholder="Seu nome" required minLength={2} maxLength={80} />
            </label>
          )}

          {showEmail && (
            <label>
              <span>E-mail</span>
              <input name="email" type="email" autoComplete="email" placeholder="voce@email.com" required />
            </label>
          )}

          {showPassword && (
            <label>
              <span>{mode === "update-password" ? "Nova senha" : "Senha"}</span>
              <input
                name="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </label>
          )}

          {state.message && (
            <p className={`form-message ${state.status}`} role="status">{state.message}</p>
          )}

          <button className="auth-submit" disabled={pending}>
            {pending ? "Processando..." : content.button}
          </button>
        </form>

        {mode === "login" && (
          <>
            <Link href="/esqueci-senha" className="auth-secondary-link">Esqueci minha senha</Link>
            <p className="auth-switch">Ainda não tem conta? <Link href="/cadastro">Criar conta</Link></p>
          </>
        )}
        {mode === "signup" && <p className="auth-switch">Já tem conta? <Link href="/entrar">Entrar</Link></p>}
        {mode === "reset" && <p className="auth-switch"><Link href="/entrar">Voltar para entrar</Link></p>}
      </section>
    </main>
  );
}
