import Link from "next/link";
import { CalendarIcon, HomeIcon, PlusIcon, SparklesIcon, UserIcon } from "@/components/icons";

type ActiveNav = "home" | "today" | "journey" | "profile" | "calendar";

export function MobileShell({ children, active = "today" }: { children: React.ReactNode; active?: ActiveNav }) {
  const todayActive = active === "today" || active === "home";
  return (
    <main className="app-stage">
      <section className="phone-shell">
        <div className="phone-content page-reveal">{children}</div>

        <Link className="quick-register-nav quick-register-nav-direct" href="/registrar" aria-label="Abrir central de registros">
          <span><PlusIcon /></span>
          <small>Registrar</small>
        </Link>

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
