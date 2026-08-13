import Link from "next/link";
import { CalendarIcon, HomeIcon, UserIcon } from "@/components/icons";

export function MobileShell({ children, active = "home" }: { children: React.ReactNode; active?: "home" | "profile" | "calendar" }) {
  return (
    <main className="app-stage">
      <section className="phone-shell">
        <div className="phone-content">{children}</div>
        <nav className="bottom-nav" aria-label="Navegação principal">
          <Link href="/" className={active === "home" ? "active" : ""}><HomeIcon/><span>Início</span></Link>
          <Link href="/perfil" className={active === "profile" ? "active" : ""}><UserIcon/><span>Perfil</span></Link>
          <Link href="/calendario" className={active === "calendar" ? "active" : ""}><CalendarIcon/><span>Calendário</span></Link>
        </nav>
      </section>
    </main>
  );
}
