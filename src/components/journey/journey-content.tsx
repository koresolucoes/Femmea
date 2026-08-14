import Link from "next/link";
import { CalendarIcon, ChevronRightIcon, HeartIcon, SparklesIcon } from "@/components/icons";
import { CONTENT_LIBRARY } from "@/lib/journey";
import type { JourneyStage } from "@/types/journey";

const recommended: Record<JourneyStage, string[]> = {
  planning: ["cuidados-antes", "alimentacao-e-rotina", "como-funciona"],
  cycle_monitoring: ["sinais-e-sintomas", "alimentacao-e-rotina", "duvidas-frequentes"],
  insemination_day: ["como-funciona", "cuidados-antes", "duvidas-frequentes"],
  post_procedure: ["sinais-e-sintomas", "duvidas-frequentes", "alimentacao-e-rotina"],
  pregnancy_test: ["duvidas-frequentes", "sinais-e-sintomas", "como-funciona"],
};

export function JourneyContent({ stage }: { stage?: JourneyStage }) {
  const ordered = stage ? [...CONTENT_LIBRARY].sort((a, b) => {
    const ai = recommended[stage].indexOf(a.slug);
    const bi = recommended[stage].indexOf(b.slug);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  }) : CONTENT_LIBRARY;

  return <section className="content-screen"><div className="checklist-header-copy"><span className="stage-kicker">{stage ? "Pode te ajudar agora" : "Conteúdos para você"}</span><h2>Informação no momento em que faz sentido</h2><p>O conteúdo acompanha sua fase atual e continua sendo educativo, não uma prescrição.</p></div><div className="content-list">{ordered.map((content, index) => { const href = content.slug === "duvidas-frequentes" ? "/duvidas" : `/inseminacao/conteudos/${content.slug}`; const isRecommended = stage && index < 3; return <Link key={content.slug} className={`content-row ${isRecommended ? "is-recommended" : ""}`} href={href}><span className="content-icon">{content.icon === "heart" ? <HeartIcon /> : content.icon === "sparkles" ? <SparklesIcon /> : <CalendarIcon />}</span><span><strong>{content.title}</strong><small>{isRecommended ? `Para esta etapa · ${content.category}` : content.category}</small></span><ChevronRightIcon /></Link>; })}</div></section>;
}
