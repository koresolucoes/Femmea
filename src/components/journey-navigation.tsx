import Link from "next/link";

type JourneyTab = "timeline" | "checklist" | "conteudos";

export function FemmeaJourneyHeader({
  backHref = "/",
  title = "Inseminação",
}: {
  backHref?: string;
  title?: string;
}) {
  return (
    <>
      <header className="journey-header">
        <Link href={backHref} className="back-button" aria-label="Voltar">‹</Link>
        <div className="journey-brand">Femmea</div>
        <span className="header-spacer" />
      </header>
      <h1 className="page-title">{title}</h1>
    </>
  );
}

export function JourneyTabs({ active }: { active: JourneyTab }) {
  return (
    <nav className="tabs" aria-label="Seções da jornada">
      <Link className={active === "timeline" ? "active" : ""} href="/inseminacao?tab=timeline">Timeline</Link>
      <Link className={active === "checklist" ? "active" : ""} href="/inseminacao?tab=checklist">Checklist</Link>
      <Link className={active === "conteudos" ? "active" : ""} href="/inseminacao?tab=conteudos">Conteúdos</Link>
    </nav>
  );
}
