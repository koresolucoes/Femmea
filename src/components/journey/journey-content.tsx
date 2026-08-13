import Link from "next/link";
import { CalendarIcon, ChevronRightIcon, HeartIcon, SparklesIcon } from "@/components/icons";
import { CONTENT_LIBRARY } from "@/lib/journey";

export function JourneyContent() {
  return (
    <section className="content-screen">
      <div className="checklist-header-copy">
        <span className="stage-kicker">Conteúdos para você</span>
        <h2>Informações organizadas para cada fase</h2>
        <p>Conteúdo educativo não substitui avaliação ou orientação profissional.</p>
      </div>
      <div className="content-list">
        {CONTENT_LIBRARY.map((content) => {
          const href = content.slug === "duvidas-frequentes" ? "/duvidas" : `/inseminacao/conteudos/${content.slug}`;
          return (
            <Link key={content.slug} className="content-row" href={href}>
              <span className="content-icon">{content.icon === "heart" ? <HeartIcon /> : content.icon === "sparkles" ? <SparklesIcon /> : <CalendarIcon />}</span>
              <span><strong>{content.title}</strong><small>{content.category}</small></span>
              <ChevronRightIcon />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
