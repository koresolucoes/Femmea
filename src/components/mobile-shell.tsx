import Link from "next/link";
import { CalendarIcon, HeartIcon, HomeIcon, PlusIcon, SparklesIcon, UserIcon } from "@/components/icons";

type ActiveNav = "home" | "today" | "journey" | "profile" | "calendar";

export function MobileShell({ children, active = "today" }: { children: React.ReactNode; active?: ActiveNav }) {
  const todayActive = active === "today" || active === "home";
  return (
    <main className="app-stage">
      <section className="phone-shell">
        <div className="phone-content page-reveal">{children}</div>

        <details className="quick-register-nav">
          <summary aria-label="Registrar"><span><PlusIcon /></span><small>Registrar</small></summary>
          <div className="quick-register-nav-backdrop" />
          <section className="quick-register-nav-sheet" aria-label="Registro rápido">
            <div className="sheet-handle" />
            <span className="stage-kicker">Registro rápido</span>
            <h2>O que faz sentido guardar agora?</h2>
            <p>Comece pelo contexto. As ferramentas específicas do ciclo ficam reunidas dentro do acompanhamento.</p>
            <div className="quick-register-nav-grid">
              <Link href="/sintomas/registrar"><span><HeartIcon /></span><strong>Como estou hoje</strong><small>Sintomas e emocional</small></Link>
              <Link href="/inseminacao?stage=cycle_monitoring"><span><SparklesIcon /></span><strong>Acompanhar ciclo</strong><small>Fase, calendário e registros</small></Link>
              <Link href="/lembretes"><span><CalendarIcon /></span><strong>Novo lembrete</strong><small>Evento, exame ou tarefa</small></Link>
            </div>
          </section>
        </details>

        <nav className="bottom-nav bottom-nav-five" aria-label="Navegação principal">
          <Link href="/" className={todayActive ? "active" : ""}><HomeIcon/><span>Hoje</span></Link>
          <Link href="/inseminacao" className={active === "journey" ? "active" : ""}><SparklesIcon/><span>Jornada</span></Link>
          <span className="bottom-nav-gap" aria-hidden="true" />
          <Link href="/calendario" className={active === "calendar" ? "active" : ""}><CalendarIcon/><span>Calendário</span></Link>
          <Link href="/perfil" className={active === "profile" ? "active" : ""}><UserIcon/><span>Perfil</span></Link>
        </nav>
      </section>
    </main>
  );
}
